package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.Inventory.presentation.CreateInventoryRequest;
import com.exmple.stockpilot.Warehouse.presentation.CreateWarehouseRequest;
import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.goodsreceipt.presentation.CreateGoodsReceiptRequest;
import com.exmple.stockpilot.goodsreceipt.presentation.GoodsReceiptItemRequest;
import com.exmple.stockpilot.product.presentation.CreateProductRequest;
import com.exmple.stockpilot.purchaseorder.presentation.CreatePurchaseOrderFromRequisitionRequest;
import com.exmple.stockpilot.purchaserequisition.presentation.CreatePurchaseRequisitionRequest;
import com.exmple.stockpilot.purchasinginforecord.presentation.CreatePurchasingInfoRecordRequest;
import com.exmple.stockpilot.supplier.presentation.CreateSupplierRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProcurementSupplyChainIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-PROC-01: Complete Procure-to-Pay Supply Chain workflow")
    void shouldExecuteFullProcureToPayLifecycle() throws Exception {
        String adminToken = generateTokenFor("admin.proc@stockpilot.com", Role.ADMIN);
        String managerToken = generateTokenFor("buyer.proc@stockpilot.com", Role.MANAGER);
        String clerkToken = generateTokenFor("clerk.proc@stockpilot.com", Role.USER);

        // 1. Setup Master Data: Warehouse
        CreateWarehouseRequest whReq = new CreateWarehouseRequest("Hub Central Strasbourg", "1 Rue du Rhin", "Strasbourg", "France", "67000");
        String whRes = mockMvc.perform(post("/api/warehouses")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(whReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String warehouseId = objectMapper.readTree(whRes).get("id").asText();

        // 2. Setup Master Data: Product
        CreateProductRequest prReq = new CreateProductRequest("Vérin Pneumatique 50mm", "Vérin double effet", "SKU-VRN-50", new BigDecimal("75.00"), "EUR", "PCS", "SPARE_PART");
        String prRes = mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String productId = objectMapper.readTree(prRes).get("id").asText();

        // 3. Setup Master Data: Supplier
        CreateSupplierRequest suppReq = new CreateSupplierRequest("Festo Automation SAS", "order@festo.com", "+33140000000", "8 Rue Festo, Paris", "FR888888888", "NET30", "EUR");
        String suppRes = mockMvc.perform(post("/api/suppliers")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(managerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suppReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String supplierId = objectMapper.readTree(suppRes).get("id").asText();

        // 4. Initial Stock: 10 units
        CreateInventoryRequest invReq = new CreateInventoryRequest(productId, warehouseId, 10, 5);
        mockMvc.perform(post("/api/inventories")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invReq)))
                .andExpect(status().isCreated());

        // 5. Create Purchasing Info Record (PIR)
        CreatePurchasingInfoRecordRequest pirReq = new CreatePurchasingInfoRecordRequest(
                UUID.fromString(productId),
                UUID.fromString(supplierId),
                "FESTO-PNEU-50",
                new BigDecimal("68.00"),
                "EUR",
                5,
                5,
                20,
                new BigDecimal("5.0"),
                true
        );
        mockMvc.perform(post("/api/purchasing-info-records")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(managerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pirReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.baseUnitPrice", is(68.00)));

        // 6. Magasinier creates a Purchase Requisition (DA) for 30 units
        CreatePurchaseRequisitionRequest prqReq = new CreatePurchaseRequisitionRequest(
                productId,
                warehouseId,
                30,
                LocalDate.now().plusDays(7),
                "Réapprovisionnement préventif ligne d'assemblage"
        );
        String prqRes = mockMvc.perform(post("/api/purchase-requisitions")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(clerkToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prqReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andReturn().getResponse().getContentAsString();
        String requisitionId = objectMapper.readTree(prqRes).get("id").asText();

        // 7. Magasinier submits the requisition
        mockMvc.perform(post("/api/purchase-requisitions/" + requisitionId + "/submit")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(clerkToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUBMITTED")));

        // 8. Buyer / Manager approves the requisition
        mockMvc.perform(post("/api/purchase-requisitions/" + requisitionId + "/approve")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")));

        // 9. Buyer converts approved DA into Purchase Order (PO)
        CreatePurchaseOrderFromRequisitionRequest poReq = new CreatePurchaseOrderFromRequisitionRequest(
                requisitionId,
                supplierId,
                new BigDecimal("65.00"),
                LocalDate.now().plusDays(5)
        );
        String poRes = mockMvc.perform(post("/api/purchase-orders/from-requisition")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(managerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andReturn().getResponse().getContentAsString();
        String poId = objectMapper.readTree(poRes).get("id").asText();

        // 10. Buyer issues the PO to the supplier
        mockMvc.perform(post("/api/purchase-orders/" + poId + "/issue")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ISSUED")));

        // 11. Delivery arrives: Magasinier creates Goods Receipt (GR) for 30 units
        CreateGoodsReceiptRequest grReq = new CreateGoodsReceiptRequest(
                UUID.fromString(poId),
                "BL-FESTO-2026-999",
                List.of(new GoodsReceiptItemRequest(UUID.fromString(productId), 30)),
                "Livraison complète en parfait état"
        );
        mockMvc.perform(post("/api/goods-receipts")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(clerkToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(grReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grNumber", notNullValue()))
                .andExpect(jsonPath("$.deliveryNoteNumber", is("BL-FESTO-2026-999")));

        // 12. Verify Inventory stock was automatically increased (10 initial + 30 received = 40)
        mockMvc.perform(get("/api/inventories/product/" + productId + "/warehouse/" + warehouseId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(clerkToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableQuantity", is(40)));
    }
}

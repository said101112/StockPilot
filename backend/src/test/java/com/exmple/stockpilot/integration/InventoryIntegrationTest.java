package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.Inventory.presentation.CreateInventoryRequest;
import com.exmple.stockpilot.Inventory.presentation.ScrapStockRequest;
import com.exmple.stockpilot.Inventory.presentation.StockOperationRequest;
import com.exmple.stockpilot.Warehouse.presentation.CreateWarehouseRequest;
import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.product.presentation.CreateProductRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class InventoryIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-INV-01: Anonymous access to /api/inventories returns 401")
    void shouldRejectAnonymousAccessToInventory() throws Exception {
        mockMvc.perform(get("/api/inventories"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("IT-INV-02: USER cannot create initial inventory (403 Forbidden)")
    void shouldForbidRegularUserFromCreatingInventory() throws Exception {
        String token = generateTokenFor("clerk.user@stockpilot.com", Role.USER);

        CreateInventoryRequest req = new CreateInventoryRequest(
                java.util.UUID.randomUUID().toString(),
                java.util.UUID.randomUUID().toString(),
                100,
                20
        );

        mockMvc.perform(post("/api/inventories")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IT-INV-03: Full inventory lifecycle (create, consume, increase, scrap)")
    void shouldManageFullInventoryOperations() throws Exception {
        String adminToken = generateTokenFor("admin.inv@stockpilot.com", Role.ADMIN);
        String userToken = generateTokenFor("clerk.inv@stockpilot.com", Role.USER);

        // 1. Create a Warehouse
        CreateWarehouseRequest whReq = new CreateWarehouseRequest("Entrepôt Lyon Sud", "15 Rue de l'Industrie", "Lyon", "France", "69007");
        String whRes = mockMvc.perform(post("/api/warehouses")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(whReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String warehouseId = objectMapper.readTree(whRes).get("id").asText();

        // 2. Create a Product
        CreateProductRequest prReq = new CreateProductRequest("Roulement à billes 608ZZ", "Roulement standard", "SKU-RLMT-608", new BigDecimal("4.50"), "EUR", "PCS", "RAW_MATERIAL");
        String prRes = mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String productId = objectMapper.readTree(prRes).get("id").asText();

        // 3. Create initial Inventory (50 units, reorder point 15)
        CreateInventoryRequest invReq = new CreateInventoryRequest(productId, warehouseId, 50, 15);
        String invRes = mockMvc.perform(post("/api/inventories")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.availableQuantity", is(50)))
                .andExpect(jsonPath("$.reorderPoint", is(15)))
                .andReturn().getResponse().getContentAsString();
        String inventoryId = objectMapper.readTree(invRes).get("id").asText();

        // 4. Warehouse clerk consumes 10 units (remaining: 40)
        mockMvc.perform(post("/api/inventories/" + inventoryId + "/consume")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(userToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StockOperationRequest(10))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableQuantity", is(40)));

        // 5. Manager increases stock by 20 units (remaining: 60)
        mockMvc.perform(post("/api/inventories/" + inventoryId + "/increase")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StockOperationRequest(20))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableQuantity", is(60)));

        // 6. Scrapping: Magasinier declares 5 broken parts (remaining: 55)
        ScrapStockRequest scrapReq = new ScrapStockRequest(5, "Écrasement palette chariot élévateur", "Said Magasinier");
        mockMvc.perform(post("/api/inventories/" + inventoryId + "/scrap")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(userToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scrapReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityScrapped", is(5)))
                .andExpect(jsonPath("$.scrapReason", is("Écrasement palette chariot élévateur")))
                .andExpect(jsonPath("$.remainingAvailable", is(55)));

        // 7. Verify inventory retrieval by Product and Warehouse
        mockMvc.perform(get("/api/inventories/product/" + productId + "/warehouse/" + warehouseId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableQuantity", is(55)));
    }
}

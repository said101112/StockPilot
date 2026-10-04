package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.Inventory.presentation.CreateInventoryRequest;
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

class StockMovementAndAlertIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-MOV-01: Anonymous access to movements and alerts returns 401")
    void shouldRejectAnonymousAccessToMovementsAndAlerts() throws Exception {
        mockMvc.perform(get("/api/stock-movements")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/stock-alerts")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("IT-MOV-02: Consuming stock below reorder threshold triggers an active Stock Alert and records Stock Movements")
    void shouldGenerateMovementsAndTriggerAlertOnLowStock() throws Exception {
        String adminToken = generateTokenFor("admin.alert@stockpilot.com", Role.ADMIN);
        String userToken = generateTokenFor("user.alert@stockpilot.com", Role.USER);

        // 1. Warehouse & Product
        CreateWarehouseRequest whReq = new CreateWarehouseRequest("Dépôt Bordeaux", "Zone Industrielle", "Bordeaux", "France", "33000");
        String whRes = mockMvc.perform(post("/api/warehouses")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(whReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String warehouseId = objectMapper.readTree(whRes).get("id").asText();

        CreateProductRequest prReq = new CreateProductRequest("Filtre Huile Haute Pression", "Filtre hydraulique", "SKU-FLT-HP", new BigDecimal("12.00"), "EUR", "PCS", "CONSUMABLE");
        String prRes = mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String productId = objectMapper.readTree(prRes).get("id").asText();

        // 2. Initial stock: 20 units, Reorder point: 10 units
        CreateInventoryRequest invReq = new CreateInventoryRequest(productId, warehouseId, 20, 10);
        String invRes = mockMvc.perform(post("/api/inventories")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String inventoryId = objectMapper.readTree(invRes).get("id").asText();

        // 3. Scrap 15 units -> remaining is 5, which is <= reorder point (10)
        com.exmple.stockpilot.Inventory.presentation.ScrapStockRequest scrapReq =
                new com.exmple.stockpilot.Inventory.presentation.ScrapStockRequest(15, "Lot défectueux fournisseur", "Auditeur");

        mockMvc.perform(post("/api/inventories/" + inventoryId + "/scrap")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(userToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scrapReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.remainingAvailable", is(5)))
                .andExpect(jsonPath("$.alertTriggered", is(true)));

        // 4. Check Stock Movements
        mockMvc.perform(get("/api/stock-movements/product/" + productId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // 5. Check Active Alerts
        mockMvc.perform(get("/api/stock-alerts/active")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }
}

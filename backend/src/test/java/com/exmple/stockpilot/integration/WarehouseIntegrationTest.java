package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.Warehouse.presentation.CreateWarehouseRequest;
import com.exmple.stockpilot.auth.domain.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class WarehouseIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-WAR-01: Unauthenticated request to /api/warehouses returns 401")
    void shouldRejectUnauthenticatedWarehouseAccess() throws Exception {
        mockMvc.perform(get("/api/warehouses"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("IT-WAR-02: Regular USER is forbidden from creating warehouse (403)")
    void shouldForbidRegularUserFromCreatingWarehouse() throws Exception {
        String token = generateTokenFor("regular.user@stockpilot.com", Role.USER);

        CreateWarehouseRequest request = new CreateWarehouseRequest(
                "Unauthorized Depot",
                "10 rue du Port",
                "Marseille",
                "France",
                "13001"
        );

        mockMvc.perform(post("/api/warehouses")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IT-WAR-03: ADMIN can create and retrieve warehouse (201 & 200)")
    void shouldAllowAdminToCreateAndGetWarehouse() throws Exception {
        String token = generateTokenFor("admin.warehouse@stockpilot.com", Role.ADMIN);

        CreateWarehouseRequest request = new CreateWarehouseRequest(
                "Hub Logistique Nord",
                "45 Avenue de Flandre",
                "Lille",
                "France",
                "59000"
        );

        // 1. Create warehouse as ADMIN
        String responseBody = mockMvc.perform(post("/api/warehouses")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Hub Logistique Nord")))
                .andReturn().getResponse().getContentAsString();

        String warehouseId = objectMapper.readTree(responseBody).get("id").asText();

        // 2. Retrieve by ID
        mockMvc.perform(get("/api/warehouses/" + warehouseId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(warehouseId)))
                .andExpect(jsonPath("$.city", is("Lille")));

        // 3. Regular USER can view the warehouse list
        String userToken = generateTokenFor("view.user@stockpilot.com", Role.USER);
        mockMvc.perform(get("/api/warehouses")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }
}

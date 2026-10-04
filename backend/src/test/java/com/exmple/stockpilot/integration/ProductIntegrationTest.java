package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.product.presentation.CreateProductRequest;
import com.exmple.stockpilot.product.presentation.UpdateProductRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProductIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-PROD-01: Anonymous request to /api/products returns 401")
    void shouldRejectAnonymousProductsAccess() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("IT-PROD-02: Regular USER is forbidden from creating product (403)")
    void shouldForbidRegularUserFromCreatingProduct() throws Exception {
        String token = generateTokenFor("regular.user@stockpilot.com", Role.USER);

        CreateProductRequest request = new CreateProductRequest(
                "Vis M8x40",
                "Vis acier inoxydable",
                "SKU-VIS-M8",
                new BigDecimal("2.50"),
                "EUR",
                "PCS",
                "RAW_MATERIAL"
        );

        mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IT-PROD-03: ADMIN can create, update and retrieve product (201 & 200)")
    void shouldAllowAdminToManageProductLifecycle() throws Exception {
        String token = generateTokenFor("admin.product@stockpilot.com", Role.ADMIN);

        CreateProductRequest createReq = new CreateProductRequest(
                "Moteur Électrique 220V",
                "Moteur asynchrone monophasé",
                "SKU-MOT-220V-01",
                new BigDecimal("189.90"),
                "EUR",
                "PCS",
                "FINISHED_GOOD"
        );

        // 1. Create product as ADMIN
        String resContent = mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.sku", is("SKU-MOT-220V-01")))
                .andExpect(jsonPath("$.name", is("Moteur Électrique 220V")))
                .andReturn().getResponse().getContentAsString();

        String productId = objectMapper.readTree(resContent).get("id").asText();

        // 2. Retrieve by ID
        mockMvc.perform(get("/api/products/" + productId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(productId)))
                .andExpect(jsonPath("$.price", is(189.90)));

        // 3. Retrieve by SKU
        mockMvc.perform(get("/api/products/sku/SKU-MOT-220V-01")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku", is("SKU-MOT-220V-01")));

        // 4. Update product
        UpdateProductRequest updateReq = new UpdateProductRequest(
                "Moteur Électrique 220V Pro",
                "Moteur asynchrone monophasé haute performance",
                new BigDecimal("210.00"),
                "EUR",
                "PCS",
                "FINISHED_GOOD"
        );

        mockMvc.perform(put("/api/products/" + productId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Moteur Électrique 220V Pro")))
                .andExpect(jsonPath("$.price", is(210.00)));

        // 5. Retrieve product categories
        mockMvc.perform(get("/api/products/categories")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }
}

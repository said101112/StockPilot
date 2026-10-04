package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.supplier.presentation.CreateSupplierRequest;
import com.exmple.stockpilot.supplier.presentation.UpdateSupplierRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SupplierIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-SUPP-01: Anonymous request to /api/suppliers returns 401")
    void shouldRejectAnonymousSupplierAccess() throws Exception {
        mockMvc.perform(get("/api/suppliers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("IT-SUPP-02: Regular USER is forbidden from creating supplier (403)")
    void shouldForbidRegularUserFromCreatingSupplier() throws Exception {
        String token = generateTokenFor("regular.user@stockpilot.com", Role.USER);

        CreateSupplierRequest req = new CreateSupplierRequest(
                "Acme Corp",
                "contact@acme.com",
                "+33100000000",
                "1 rue de Paris",
                "FR123456789",
                "NET30",
                "EUR"
        );

        mockMvc.perform(post("/api/suppliers")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IT-SUPP-03: MANAGER can create and update supplier (201 & 200)")
    void shouldAllowManagerToCreateSupplier() throws Exception {
        String token = generateTokenFor("manager.supplier@stockpilot.com", Role.MANAGER);

        CreateSupplierRequest req = new CreateSupplierRequest(
                "Global Components Ltd",
                "sales@globalcomp.com",
                "+442079460912",
                "10 Downing St, London",
                "GB987654321",
                "NET45",
                "EUR"
        );

        // 1. Create supplier
        String res = mockMvc.perform(post("/api/suppliers")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Global Components Ltd")))
                .andExpect(jsonPath("$.email", is("sales@globalcomp.com")))
                .andReturn().getResponse().getContentAsString();

        String supplierId = objectMapper.readTree(res).get("id").asText();

        // 2. Retrieve by ID
        mockMvc.perform(get("/api/suppliers/" + supplierId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(supplierId)))
                .andExpect(jsonPath("$.name", is("Global Components Ltd")));

        // 3. Update supplier
        UpdateSupplierRequest updateReq = new UpdateSupplierRequest(
                "Global Components International",
                "sales@globalcomp-intl.com",
                "+442079460999",
                "12 Oxford St, London",
                "GB987654321",
                "NET60",
                "EUR",
                "ACTIVE"
        );

        mockMvc.perform(put("/api/suppliers/" + supplierId)
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Global Components International")))
                .andExpect(jsonPath("$.email", is("sales@globalcomp-intl.com")));
    }
}

package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.domain.model.User;
import com.exmple.stockpilot.auth.presentation.CreateUserRequest;
import com.exmple.stockpilot.auth.presentation.ResetPasswordRequest;
import com.exmple.stockpilot.auth.presentation.UpdateUserRoleRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserAdministrationIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-ADMIN-01: Anonymous access to /api/users is rejected with 401")
    void shouldRejectAnonymousAccessToUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("IT-ADMIN-02: Regular USER is forbidden from accessing /api/users (403)")
    void shouldForbidRegularUserFromAccessingUsers() throws Exception {
        String token = generateTokenFor("standard.user@stockpilot.com", Role.USER);

        mockMvc.perform(get("/api/users")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IT-ADMIN-03: MANAGER is forbidden from accessing /api/users (403)")
    void shouldForbidManagerFromAccessingUsers() throws Exception {
        String token = generateTokenFor("manager.user@stockpilot.com", Role.MANAGER);

        mockMvc.perform(get("/api/users")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IT-ADMIN-04: ADMIN can access /api/users and retrieve user list (200)")
    void shouldAllowAdminToAccessUsersList() throws Exception {
        createTestUserEntity("admin.list@stockpilot.com", "AdminPass123!", Role.ADMIN, true);
        String token = generateTokenFor("admin.list@stockpilot.com", Role.ADMIN);

        mockMvc.perform(get("/api/users")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("IT-ADMIN-05: ADMIN can create new user via /api/users (201)")
    void shouldAllowAdminToCreateUser() throws Exception {
        createTestUserEntity("admin.creator@stockpilot.com", "AdminPass123!", Role.ADMIN, true);
        String token = generateTokenFor("admin.creator@stockpilot.com", Role.ADMIN);

        CreateUserRequest req = new CreateUserRequest(
                "created.by.admin@stockpilot.com",
                "Temporary123!",
                "Alice",
                "Manager",
                Role.MANAGER
        );

        mockMvc.perform(post("/api/users")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("created.by.admin@stockpilot.com")))
                .andExpect(jsonPath("$.role", is("MANAGER")));
    }

    @Test
    @DisplayName("IT-ADMIN-06: ADMIN can toggle user status and update role")
    void shouldAllowAdminToToggleStatusAndUpdateRole() throws Exception {
        var adminEntity = createTestUserEntity("admin.manager@stockpilot.com", "AdminPass123!", Role.ADMIN, true);
        String adminToken = generateTokenFor(adminEntity.getEmail(), Role.ADMIN);

        var targetUser = createTestUserEntity("target.user@stockpilot.com", "UserPass123!", Role.USER, true);

        // 1. Toggle status
        mockMvc.perform(patch("/api/users/" + targetUser.getId() + "/toggle-status")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled", is(false)));

        // 2. Update role
        UpdateUserRoleRequest roleReq = new UpdateUserRoleRequest(Role.MANAGER);
        mockMvc.perform(patch("/api/users/" + targetUser.getId() + "/role")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("MANAGER")));

        // 3. Reset password
        ResetPasswordRequest resetReq = new ResetPasswordRequest("BrandNewPass999!");
        mockMvc.perform(patch("/api/users/" + targetUser.getId() + "/password")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("succès")));
    }
}

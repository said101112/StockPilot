package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.domain.model.User;
import com.exmple.stockpilot.auth.presentation.ChangePasswordRequest;
import com.exmple.stockpilot.auth.presentation.LoginRequest;
import com.exmple.stockpilot.auth.presentation.RegisterRequest;
import com.exmple.stockpilot.auth.presentation.UpdateProfileRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("IT-AUTH-01: Public registration creates user and returns JWT tokens")
    void shouldRegisterNewUserSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "newuser@stockpilot.com",
                "Password123!",
                "John",
                "Doe"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("newuser@stockpilot.com")))
                .andExpect(jsonPath("$.user.role", is("USER")));
    }

    @Test
    @DisplayName("IT-AUTH-02: Successful login with valid credentials")
    void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
        String email = "login.test@stockpilot.com";
        createTestUserEntity(email, "SecurePassword123!", Role.USER, true);

        LoginRequest request = new LoginRequest(email, "SecurePassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is(email)));
    }

    @Test
    @DisplayName("IT-AUTH-03: Login with invalid password returns 401 Unauthorized")
    void shouldRejectLoginWithBadCredentials() throws Exception {
        String email = "badpass.test@stockpilot.com";
        createTestUserEntity(email, "ValidPassword123!", Role.USER, true);

        LoginRequest request = new LoginRequest(email, "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }

    @Test
    @DisplayName("IT-AUTH-04: Unauthenticated access to /api/auth/me returns 401 Unauthorized")
    void shouldRejectProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("IT-AUTH-05: Authenticated access to /api/auth/me returns current user details")
    void shouldAccessCurrentUserProfileWithValidToken() throws Exception {
        String email = "me.profile@stockpilot.com";
        var entity = createTestUserEntity(email, "Password123!", Role.MANAGER, true);

        User user = User.builder()
                .id(entity.getId())
                .email(email)
                .role(Role.MANAGER)
                .enabled(true)
                .build();
        String token = jwtService.generateAccessToken(user);

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(email)))
                .andExpect(jsonPath("$.role", is("MANAGER")));
    }

    @Test
    @DisplayName("IT-AUTH-06: Authenticated user can update profile details")
    void shouldUpdateProfileSuccessfully() throws Exception {
        String email = "update.profile@stockpilot.com";
        var entity = createTestUserEntity(email, "Password123!", Role.USER, true);

        User user = User.builder()
                .id(entity.getId())
                .email(email)
                .role(Role.USER)
                .enabled(true)
                .build();
        String token = jwtService.generateAccessToken(user);

        UpdateProfileRequest updateReq = new UpdateProfileRequest(
                "Jane",
                "Smith",
                "+33612345678",
                "Logistics",
                "https://api.dicebear.com/7.x/bottts/svg?seed=Jane"
        );

        mockMvc.perform(patch("/api/auth/profile")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", is("Jane")))
                .andExpect(jsonPath("$.lastName", is("Smith")))
                .andExpect(jsonPath("$.phone", is("+33612345678")))
                .andExpect(jsonPath("$.department", is("Logistics")))
                .andExpect(jsonPath("$.avatarUrl", is("https://api.dicebear.com/7.x/bottts/svg?seed=Jane")));
    }

    @Test
    @DisplayName("IT-AUTH-07: Change password succeeds and previous password is invalidated")
    void shouldChangePasswordAndAuthenticateWithNewPassword() throws Exception {
        String email = "changepass@stockpilot.com";
        var entity = createTestUserEntity(email, "OldPassword123!", Role.USER, true);

        User user = User.builder()
                .id(entity.getId())
                .email(email)
                .role(Role.USER)
                .enabled(true)
                .build();
        String token = jwtService.generateAccessToken(user);

        ChangePasswordRequest changeReq = new ChangePasswordRequest("OldPassword123!", "NewSecretPassword888!");

        // 1. Change password
        mockMvc.perform(patch("/api/auth/password")
                        .header(HttpHeaders.AUTHORIZATION, getBearerAuthHeader(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isOk());

        // 2. Old password fails
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "OldPassword123!"))))
                .andExpect(status().isUnauthorized());

        // 3. New password succeeds
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "NewSecretPassword888!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()));
    }

    @Test
    @DisplayName("IT-AUTH-08: Disabled user cannot login")
    void shouldRejectDisabledUserLogin() throws Exception {
        String email = "disabled.user@stockpilot.com";
        createTestUserEntity(email, "Password123!", Role.USER, false);

        LoginRequest request = new LoginRequest(email, "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}

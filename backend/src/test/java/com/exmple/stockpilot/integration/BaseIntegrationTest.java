package com.exmple.stockpilot.integration;

import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.domain.model.User;
import com.exmple.stockpilot.auth.infrastructure.persistence.SpringDataUserRepository;
import com.exmple.stockpilot.auth.infrastructure.persistence.UserJpaEntity;
import com.exmple.stockpilot.auth.infrastructure.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;
import java.util.UUID;

@SpringBootTest
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired
    protected WebApplicationContext webApplicationContext;

    protected MockMvc mockMvc;

    @BeforeEach
    void setUpMockMvc() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    protected ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Autowired
    protected SpringDataUserRepository userRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JwtService jwtService;

    protected UserJpaEntity createTestUserEntity(String email, String rawPassword, Role role, boolean enabled) {
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
        UserJpaEntity entity = UserJpaEntity.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName("Test")
                .lastName("User")
                .role(role)
                .enabled(enabled)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return userRepository.save(entity);
    }

    protected String generateTokenFor(String email, Role role) {
        UserJpaEntity entity = userRepository.findByEmail(email).orElseGet(() ->
                createTestUserEntity(email, "Password123!", role, true)
        );
        User user = User.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .role(entity.getRole())
                .enabled(entity.isEnabled())
                .build();
        return jwtService.generateAccessToken(user);
    }

    protected String getBearerAuthHeader(String token) {
        return "Bearer " + token;
    }
}

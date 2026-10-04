package com.exmple.stockpilot.auth.application.service;

import com.exmple.stockpilot.auth.application.port.in.AuthResult;
import com.exmple.stockpilot.auth.application.port.in.LoginCommand;
import com.exmple.stockpilot.auth.application.port.in.RefreshTokenCommand;
import com.exmple.stockpilot.auth.application.port.out.RefreshTokenRepository;
import com.exmple.stockpilot.auth.application.port.out.UserRepository;
import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.domain.model.RefreshToken;
import com.exmple.stockpilot.auth.domain.model.User;
import com.exmple.stockpilot.auth.infrastructure.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private UUID sampleUserId;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleUser = User.builder()
                .id(sampleUserId)
                .email("admin@stockpilot.com")
                .passwordHash("encoded_pwd")
                .firstName("Super")
                .lastName("Admin")
                .role(Role.ADMIN)
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("Devrait authentifier avec succès et générer les tokens")
    void shouldLoginSuccessfully() {
        when(userRepository.findByEmail("admin@stockpilot.com")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateAccessToken(sampleUser)).thenReturn("access_token_jwt");
        when(jwtService.generateRefreshToken(sampleUser)).thenReturn("refresh_token_jwt");
        when(jwtService.getRefreshTtlDays()).thenReturn(7L);
        when(jwtService.getAccessTtlSeconds()).thenReturn(3600L);

        AuthResult result = authService.login(new LoginCommand("admin@stockpilot.com", "Admin@1234"));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));

        assertThat(result.accessToken()).isEqualTo("access_token_jwt");
        assertThat(result.refreshToken()).isEqualTo("refresh_token_jwt");
        assertThat(result.user().getEmail()).isEqualTo("admin@stockpilot.com");
    }

    @Test
    @DisplayName("Devrait lever une exception si l'utilisateur n'existe pas en base après authentification")
    void shouldThrowExceptionWhenUserNotFoundOnLogin() {
        when(userRepository.findByEmail("ghost@stockpilot.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginCommand("ghost@stockpilot.com", "pwd")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Devrait rafraîchir le token avec succès")
    void shouldRefreshSuccessfully() {
        RefreshToken validToken = RefreshToken.builder()
                .userId(sampleUserId)
                .token("valid_rt")
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken("valid_rt")).thenReturn(Optional.of(validToken));
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateAccessToken(sampleUser)).thenReturn("new_access_token");
        when(jwtService.generateRefreshToken(sampleUser)).thenReturn("new_refresh_token");
        when(jwtService.getRefreshTtlDays()).thenReturn(7L);
        when(jwtService.getAccessTtlSeconds()).thenReturn(3600L);

        AuthResult result = authService.refresh(new RefreshTokenCommand("valid_rt"));

        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
        assertThat(result.accessToken()).isEqualTo("new_access_token");
        assertThat(result.refreshToken()).isEqualTo("new_refresh_token");
    }

    @Test
    @DisplayName("Devrait refuser le rafraîchissement si le token est révoqué ou expiré")
    void shouldRejectExpiredOrRevokedRefreshToken() {
        RefreshToken expiredToken = RefreshToken.builder()
                .userId(sampleUserId)
                .token("expired_rt")
                .expiresAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken("expired_rt")).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenCommand("expired_rt")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Refresh token expired or revoked");
    }

    @Test
    @DisplayName("Devrait mettre à jour le profil de l'utilisateur connecté")
    void shouldUpdateProfileSuccessfully() {
        when(userRepository.findByEmail("admin@stockpilot.com")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = authService.updateProfile("admin@stockpilot.com", "Pierre", "Curie", "+33 6 00 00 00 00", "R&D", "avatar.png");

        assertThat(updated.getFirstName()).isEqualTo("Pierre");
        assertThat(updated.getLastName()).isEqualTo("Curie");
        assertThat(updated.getPhone()).isEqualTo("+33 6 00 00 00 00");
        assertThat(updated.getDepartment()).isEqualTo("R&D");
        assertThat(updated.getAvatarUrl()).isEqualTo("avatar.png");
        verify(userRepository).save(sampleUser);
    }

    @Test
    @DisplayName("Devrait modifier le mot de passe si l'actuel est correct")
    void shouldChangePasswordSuccessfully() {
        when(userRepository.findByEmail("admin@stockpilot.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Current@123", "encoded_pwd")).thenReturn(true);
        when(passwordEncoder.encode("NewSecret@123")).thenReturn("new_encoded_pwd");

        authService.changePassword("admin@stockpilot.com", "Current@123", "NewSecret@123");

        assertThat(sampleUser.getPasswordHash()).isEqualTo("new_encoded_pwd");
        verify(userRepository).save(sampleUser);
        verify(refreshTokenRepository).revokeAllByUserId(sampleUserId);
    }

    @Test
    @DisplayName("Devrait rejeter le changement de mot de passe si le mot de passe actuel est erroné")
    void shouldRejectPasswordChangeWhenCurrentPasswordIncorrect() {
        when(userRepository.findByEmail("admin@stockpilot.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Wrong@123", "encoded_pwd")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword("admin@stockpilot.com", "Wrong@123", "NewSecret@123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Le mot de passe actuel est incorrect");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait refuser à un administrateur de se rétrograder lui-même")
    void shouldPreventSelfDemotion() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));

        assertThatThrownBy(() -> authService.updateUserRole(sampleUserId, Role.USER, "admin@stockpilot.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Vous ne pouvez pas rétrograder votre propre compte administrateur");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait refuser à un administrateur de désactiver son propre compte")
    void shouldPreventSelfDisable() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));

        assertThatThrownBy(() -> authService.toggleUserStatus(sampleUserId, "admin@stockpilot.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Vous ne pouvez pas désactiver votre propre compte");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait refuser l'inscription si l'email existe déjà")
    void shouldRejectRegistrationWhenEmailExists() {
        when(userRepository.existsByEmail("admin@stockpilot.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register("admin@stockpilot.com", "pwd", "Jean", "Dupont", Role.USER))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already exists");

        verify(userRepository, never()).save(any());
    }
}

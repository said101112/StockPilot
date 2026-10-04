package com.exmple.stockpilot.auth.domain.model;

import com.exmple.stockpilot.auth.domain.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserTest {

    @Test
    @DisplayName("Devrait créer un utilisateur valide avec le builder et vérifier ses valeurs par défaut")
    void shouldCreateValidUser() {
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .email("admin@stockpilot.com")
                .passwordHash("hashed_pwd_123")
                .firstName("Jean")
                .lastName("Dupont")
                .role(Role.ADMIN)
                .phone("+33 1 23 45 67 89")
                .department("Direction Logistique")
                .avatarUrl("https://example.com/avatar.png")
                .build();

        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getEmail()).isEqualTo("admin@stockpilot.com");
        assertThat(user.getPasswordHash()).isEqualTo("hashed_pwd_123");
        assertThat(user.getFirstName()).isEqualTo("Jean");
        assertThat(user.getLastName()).isEqualTo("Dupont");
        assertThat(user.getFullName()).isEqualTo("Jean Dupont");
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);
        assertThat(user.isEnabled()).isTrue();
        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.getPhone()).isEqualTo("+33 1 23 45 67 89");
        assertThat(user.getDepartment()).isEqualTo("Direction Logistique");
        assertThat(user.getAvatarUrl()).isEqualTo("https://example.com/avatar.png");
    }

    @Test
    @DisplayName("Devrait retourner l'email comme fullName si le prénom et le nom sont absents")
    void shouldFallbackToEmailForFullName() {
        User user = User.builder()
                .email("user@stockpilot.com")
                .passwordHash("pwd")
                .role(Role.USER)
                .build();

        assertThat(user.getFullName()).isEqualTo("user@stockpilot.com");
    }

    @Test
    @DisplayName("Devrait basculer l'état enabled avec toggleEnabled()")
    void shouldToggleEnabled() {
        User user = User.builder()
                .email("test@stockpilot.com")
                .passwordHash("pwd")
                .role(Role.USER)
                .enabled(true)
                .build();

        user.toggleEnabled();
        assertThat(user.isEnabled()).isFalse();

        user.toggleEnabled();
        assertThat(user.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("Devrait mettre à jour le rôle et refuser un rôle null")
    void shouldUpdateRoleAndRejectNull() {
        User user = User.builder()
                .email("test@stockpilot.com")
                .passwordHash("pwd")
                .role(Role.USER)
                .build();

        user.updateRole(Role.MANAGER);
        assertThat(user.getRole()).isEqualTo(Role.MANAGER);

        assertThatThrownBy(() -> user.updateRole(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Role cannot be null");
    }

    @Test
    @DisplayName("Devrait mettre à jour le mot de passe hashé")
    void shouldUpdatePasswordHash() {
        User user = User.builder()
                .email("test@stockpilot.com")
                .passwordHash("old_hash")
                .role(Role.USER)
                .build();

        user.updatePasswordHash("new_hash_456");
        assertThat(user.getPasswordHash()).isEqualTo("new_hash_456");
        assertThat(user.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Devrait mettre à jour les coordonnées du profil complet")
    void shouldUpdateFullProfile() {
        User user = User.builder()
                .email("test@stockpilot.com")
                .firstName("Alice")
                .lastName("Martin")
                .role(Role.USER)
                .build();

        user.updateProfile("Alice", "Moreau", "+33 6 12 34 56 78", "Achats", "https://api.dicebear.com/avatar.svg");

        assertThat(user.getFirstName()).isEqualTo("Alice");
        assertThat(user.getLastName()).isEqualTo("Moreau");
        assertThat(user.getFullName()).isEqualTo("Alice Moreau");
        assertThat(user.getPhone()).isEqualTo("+33 6 12 34 56 78");
        assertThat(user.getDepartment()).isEqualTo("Achats");
        assertThat(user.getAvatarUrl()).isEqualTo("https://api.dicebear.com/avatar.svg");
    }
}

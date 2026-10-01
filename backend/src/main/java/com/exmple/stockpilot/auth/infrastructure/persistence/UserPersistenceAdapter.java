package com.exmple.stockpilot.auth.infrastructure.persistence;

import com.exmple.stockpilot.auth.application.port.out.UserRepository;
import com.exmple.stockpilot.auth.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepository {

    private final SpringDataUserRepository repo;

    @Override
    public Optional<User> findByEmail(String email) {
        return repo.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return repo.findById(id).map(this::toDomain);
    }

    @Override
    public User save(User user) {
        return toDomain(repo.save(toJpa(user)));
    }

    @Override
    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    private User toDomain(UserJpaEntity e) {
        return User.builder()
                .id(e.getId())
                .email(e.getEmail())
                .passwordHash(e.getPasswordHash())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .role(e.getRole())
                .enabled(e.isEnabled())
                .accountNonExpired(e.isAccountNonExpired())
                .accountNonLocked(e.isAccountNonLocked())
                .credentialsNonExpired(e.isCredentialsNonExpired())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private UserJpaEntity toJpa(User u) {
        return UserJpaEntity.builder()
                .id(u.getId())
                .email(u.getEmail())
                .passwordHash(u.getPasswordHash())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .role(u.getRole())
                .enabled(u.isEnabled())
                .accountNonExpired(u.isAccountNonExpired())
                .accountNonLocked(u.isAccountNonLocked())
                .credentialsNonExpired(u.isCredentialsNonExpired())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}

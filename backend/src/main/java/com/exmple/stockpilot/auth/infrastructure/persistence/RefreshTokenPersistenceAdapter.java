package com.exmple.stockpilot.auth.infrastructure.persistence;

import com.exmple.stockpilot.auth.application.port.out.RefreshTokenRepository;
import com.exmple.stockpilot.auth.domain.model.RefreshToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RefreshTokenPersistenceAdapter implements RefreshTokenRepository {

    private final SpringDataRefreshTokenRepository repo;

    @Override
    public RefreshToken save(RefreshToken token) {
        return toDomain(repo.save(toJpa(token)));
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return repo.findByToken(token).map(this::toDomain);
    }

    @Override
    @Transactional
    public void revokeAllByUserId(UUID userId) {
        repo.revokeAllByUserId(userId);
    }

    @Override
    public void deleteExpired() {
        repo.deleteByExpiresAtBefore(Instant.now());
    }

    private RefreshToken toDomain(RefreshTokenJpaEntity e) {
        return RefreshToken.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .token(e.getToken())
                .expiresAt(e.getExpiresAt())
                .revoked(e.isRevoked())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private RefreshTokenJpaEntity toJpa(RefreshToken t) {
        return RefreshTokenJpaEntity.builder()
                .id(t.getId())
                .userId(t.getUserId())
                .token(t.getToken())
                .expiresAt(t.getExpiresAt())
                .revoked(t.isRevoked())
                .createdAt(t.getCreatedAt())
                .build();
    }
}

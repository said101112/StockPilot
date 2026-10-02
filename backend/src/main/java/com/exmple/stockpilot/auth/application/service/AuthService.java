package com.exmple.stockpilot.auth.application.service;

import com.exmple.stockpilot.auth.application.port.in.*;
import com.exmple.stockpilot.auth.application.port.out.RefreshTokenRepository;
import com.exmple.stockpilot.auth.application.port.out.UserRepository;
import com.exmple.stockpilot.auth.domain.model.RefreshToken;
import com.exmple.stockpilot.auth.domain.model.User;
import com.exmple.stockpilot.auth.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements LoginUseCase, RefreshTokenUseCase, CurrentUserUseCase {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResult login(LoginCommand command) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(command.email(), command.password())
        );
        User user = userRepository.findByEmail(command.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken(user);
        RefreshToken rt = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenStr)
                .expiresAt(Instant.now().plus(jwtService.getRefreshTtlDays(), ChronoUnit.DAYS))
                .revoked(false)
                .createdAt(Instant.now())
                .build();
        refreshTokenRepository.save(rt);
        return new AuthResult(accessToken, refreshTokenStr, "Bearer", jwtService.getAccessTtlSeconds(), user);
    }

    @Override
    @Transactional
    public AuthResult refresh(RefreshTokenCommand command) {
        RefreshToken rt = refreshTokenRepository.findByToken(command.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (rt.isRevoked() || rt.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }
        User user = userRepository.findById(rt.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // revoke old
        refreshTokenRepository.save(RefreshToken.builder()
                .id(rt.getId())
                .userId(rt.getUserId())
                .token(rt.getToken())
                .expiresAt(rt.getExpiresAt())
                .revoked(true)
                .createdAt(rt.getCreatedAt())
                .build());
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken(user);
        RefreshToken newRt = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenStr)
                .expiresAt(Instant.now().plus(jwtService.getRefreshTtlDays(), ChronoUnit.DAYS))
                .revoked(false)
                .createdAt(Instant.now())
                .build();
        refreshTokenRepository.save(newRt);
        return new AuthResult(accessToken, refreshTokenStr, "Bearer", jwtService.getAccessTtlSeconds(), user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    @Transactional
    public void register(String email, String password, String firstName, String lastName, com.exmple.stockpilot.auth.domain.enums.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        userRepository.save(user);
    }
}

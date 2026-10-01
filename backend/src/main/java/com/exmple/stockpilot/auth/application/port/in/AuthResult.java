package com.exmple.stockpilot.auth.application.port.in;

import com.exmple.stockpilot.auth.domain.model.User;

public record AuthResult(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        User user
) {
}

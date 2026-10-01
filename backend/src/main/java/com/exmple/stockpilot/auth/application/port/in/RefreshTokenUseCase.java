package com.exmple.stockpilot.auth.application.port.in;

public interface RefreshTokenUseCase {
    AuthResult refresh(RefreshTokenCommand command);
}

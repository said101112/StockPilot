package com.exmple.stockpilot.auth.application.port.in;

public interface LoginUseCase {
    AuthResult login(LoginCommand command);
}

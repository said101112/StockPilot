package com.exmple.stockpilot.auth.application.port.in;

import com.exmple.stockpilot.auth.domain.model.User;

public interface CurrentUserUseCase {
    User getCurrentUser(String email);
}

package com.exmple.stockpilot.auth.presentation;

import com.exmple.stockpilot.auth.domain.enums.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull(message = "Le rôle est requis")
        Role role
) {}

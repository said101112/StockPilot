package com.exmple.stockpilot.auth.presentation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Le nouveau mot de passe est requis")
        @Size(min = 6, message = "Le mot de passe doit comporter au moins 6 caractères")
        String newPassword
) {}

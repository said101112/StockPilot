package com.exmple.stockpilot.auth.presentation;

import com.exmple.stockpilot.auth.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "L'adresse email est requise")
        @Email(message = "L'adresse email doit être valide")
        String email,

        @NotBlank(message = "Le mot de passe initial est requis")
        @Size(min = 6, message = "Le mot de passe doit comporter au moins 6 caractères")
        String password,

        @NotBlank(message = "Le prénom est requis")
        String firstName,

        @NotBlank(message = "Le nom est requis")
        String lastName,

        @NotNull(message = "Le rôle est requis")
        Role role
) {}

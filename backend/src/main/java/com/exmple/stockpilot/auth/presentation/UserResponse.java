package com.exmple.stockpilot.auth.presentation;

import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.domain.model.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String fullName,
        Role role,
        boolean enabled,
        String avatarUrl,
        String phone,
        String department,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getFullName(),
                u.getRole(),
                u.isEnabled(),
                u.getAvatarUrl(),
                u.getPhone(),
                u.getDepartment(),
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}

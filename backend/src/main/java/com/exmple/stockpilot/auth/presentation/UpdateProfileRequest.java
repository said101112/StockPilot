package com.exmple.stockpilot.auth.presentation;

public record UpdateProfileRequest(
        String firstName,
        String lastName,
        String phone,
        String department,
        String avatarUrl
) {}

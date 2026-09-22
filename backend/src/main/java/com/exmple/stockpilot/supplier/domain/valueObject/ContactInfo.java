package com.exmple.stockpilot.supplier.domain.valueObject;

import java.util.Objects;

public record ContactInfo(String email, String phoneNumber) {

    public ContactInfo {
        Objects.requireNonNull(email, "Email cannot be null");
        Objects.requireNonNull(phoneNumber, "Phone number cannot be null");

        if (email.isBlank() || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format: " + email);
        }

        if (phoneNumber.isBlank()) {
            throw new IllegalArgumentException("Phone number cannot be blank");
        }
    }

    public static ContactInfo of(String email, String phoneNumber) {
        return new ContactInfo(email, phoneNumber);
    }
}

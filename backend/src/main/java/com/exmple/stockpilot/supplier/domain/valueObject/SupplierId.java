package com.exmple.stockpilot.supplier.domain.valueObject;

import java.util.Objects;
import java.util.UUID;

public record SupplierId(UUID value) {

    public SupplierId {
        Objects.requireNonNull(value, "SupplierId value cannot be null");
    }

    public static SupplierId generate() {
        return new SupplierId(UUID.randomUUID());
    }

    public static SupplierId from(UUID value) {
        return new SupplierId(value);
    }
}

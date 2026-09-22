package com.exmple.stockpilot.stockmovement.domain.valueobject;

import java.util.Objects;
import java.util.UUID;

public record StockMovementId(UUID value) {
    public StockMovementId {
        Objects.requireNonNull(value, "StockMovementId cannot be null");
    }

    public static StockMovementId generate() {
        return new StockMovementId(UUID.randomUUID());
    }

    public static StockMovementId from(UUID value) {
        return new StockMovementId(value);
    }
}

package com.exmple.stockpilot.stockalert.domain.valueobject;

import java.util.Objects;
import java.util.UUID;

public record StockAlertId(UUID value) {
    public StockAlertId {
        Objects.requireNonNull(value, "StockAlertId cannot be null");
    }

    public static StockAlertId generate() {
        return new StockAlertId(UUID.randomUUID());
    }

    public static StockAlertId from(UUID value) {
        return new StockAlertId(value);
    }
}

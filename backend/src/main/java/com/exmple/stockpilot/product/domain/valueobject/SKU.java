package com.exmple.stockpilot.product.domain.valueobject;
import java.util.Objects;
public record SKU(String value) {
    public SKU {
        Objects.requireNonNull(value, "SKU cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("SKU cannot be empty");
        }
    }
    public static SKU of(String value) {
        return new SKU(value);
    }
}
package com.exmple.stockpilot.product.domain.valueobject;

import java.util.Objects;

/**
 * Value Object représentant l'Unité de Mesure de Base (Base Unit of Measure - UOM).
 * Dans SAP MM, tout article doit obligatoirement avoir une unité de mesure (ex: PCS, KG, L, M, BOX).
 */
public record UnitOfMeasure(String value) {

    public UnitOfMeasure {
        Objects.requireNonNull(value, "Unit of measure cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("Unit of measure cannot be empty");
        }
        value = value.trim().toUpperCase();
    }

    public static UnitOfMeasure of(String value) {
        return new UnitOfMeasure(value);
    }
}

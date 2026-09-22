package com.exmple.stockpilot.product.presentation;

import com.exmple.stockpilot.product.application.port.in.CreateProductCommand;
import java.math.BigDecimal;

public record CreateProductRequest(
        String name,
        String description,
        String sku,
        BigDecimal price,
        String currency,
        String unitOfMeasure,
        String category
) {
    public CreateProductCommand toCommand() {
        return new CreateProductCommand(
                name,
                description,
                sku,
                price,
                currency != null ? currency : "EUR",
                unitOfMeasure != null ? unitOfMeasure : "PCS",
                category != null ? category : "FINISHED_GOOD"
        );
    }
}

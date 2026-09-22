package com.exmple.stockpilot.product.application.port.in;

import com.exmple.stockpilot.product.domain.model.Product;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        String sku,
        BigDecimal price,
        String currency,
        String unitOfMeasure,
        String category,
        String status
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId().value(),
                product.getName(),
                product.getDescription(),
                product.getSku().value(),
                product.getPrice().amount(),
                product.getPrice().currency(),
                product.getUnitOfMeasure() != null ? product.getUnitOfMeasure().value() : "PCS",
                product.getCategory() != null ? product.getCategory().name() : "FINISHED_GOOD",
                product.getStatus().name()
        );
    }
}

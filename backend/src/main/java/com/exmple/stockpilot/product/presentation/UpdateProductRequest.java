package com.exmple.stockpilot.product.presentation;

import java.math.BigDecimal;

public record UpdateProductRequest(
        String name,
        String description,
        BigDecimal price,
        String currency,
        String unitOfMeasure,
        String category
) {
}

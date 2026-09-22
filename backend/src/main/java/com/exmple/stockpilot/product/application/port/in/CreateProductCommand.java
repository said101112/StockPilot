package com.exmple.stockpilot.product.application.port.in;

import java.math.BigDecimal;

public record CreateProductCommand(
        String name,
        String description,
        String sku,
        BigDecimal priceAmount,
        String currency,
        String unitOfMeasure,
        String category
) {
}

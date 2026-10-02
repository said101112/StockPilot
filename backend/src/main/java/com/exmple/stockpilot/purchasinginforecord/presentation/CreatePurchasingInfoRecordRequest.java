package com.exmple.stockpilot.purchasinginforecord.presentation;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePurchasingInfoRecordRequest(
        UUID productId,
        UUID supplierId,
        String supplierPartNumber,
        BigDecimal baseUnitPrice,
        String currency,
        Integer leadTimeDays,
        Integer minOrderQuantity,
        Integer discountTierQuantity,
        BigDecimal discountPercentage,
        Boolean preferred
) {}

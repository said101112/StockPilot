package com.exmple.stockpilot.purchasinginforecord.presentation;

import com.exmple.stockpilot.purchasinginforecord.infrastructure.persistence.PurchasingInfoRecordJpaEntity;

import java.math.BigDecimal;
import java.util.UUID;

public record PurchasingInfoRecordResponse(
        UUID id,
        UUID productId,
        String productName,
        String productSku,
        UUID supplierId,
        String supplierName,
        String supplierPartNumber,
        BigDecimal baseUnitPrice,
        String currency,
        int leadTimeDays,
        int minOrderQuantity,
        int discountTierQuantity,
        BigDecimal discountPercentage,
        boolean preferred,
        boolean active
) {
    public static PurchasingInfoRecordResponse from(
            PurchasingInfoRecordJpaEntity entity,
            String productName,
            String productSku,
            String supplierName
    ) {
        return new PurchasingInfoRecordResponse(
                entity.getId(),
                entity.getProductId(),
                productName,
                productSku,
                entity.getSupplierId(),
                supplierName,
                entity.getSupplierPartNumber(),
                entity.getBaseUnitPrice(),
                entity.getCurrency(),
                entity.getLeadTimeDays(),
                entity.getMinOrderQuantity(),
                entity.getDiscountTierQuantity(),
                entity.getDiscountPercentage(),
                entity.isPreferred(),
                entity.isActive()
        );
    }
}

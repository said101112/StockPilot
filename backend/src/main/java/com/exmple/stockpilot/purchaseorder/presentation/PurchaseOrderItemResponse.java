package com.exmple.stockpilot.purchaseorder.presentation;

import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrderItem;

import java.math.BigDecimal;
import java.util.UUID;

public record PurchaseOrderItemResponse(
        UUID id,
        UUID productId,
        String productName,
        String sku,
        int orderedQuantity,
        int receivedQuantity,
        int remainingQuantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice
) {
    public static PurchaseOrderItemResponse from(PurchaseOrderItem item) {
        return new PurchaseOrderItemResponse(
                item.getId(),
                item.getProductId().value(),
                item.getProductName(),
                item.getSku(),
                item.getOrderedQuantity(),
                item.getReceivedQuantity(),
                item.getRemainingQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice()
        );
    }
}

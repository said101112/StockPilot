package com.exmple.stockpilot.stockalert.presentation;

import com.exmple.stockpilot.stockalert.domain.model.StockAlert;

import java.time.LocalDateTime;
import java.util.UUID;

public record StockAlertResponse(
        UUID id,
        UUID productId,
        UUID warehouseId,
        int currentStock,
        int reorderPoint,
        String severity,
        String status,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
) {
    public static StockAlertResponse from(StockAlert alert) {
        return new StockAlertResponse(
                alert.getId().value(),
                alert.getProductId().value(),
                alert.getWarehouseId().value(),
                alert.getCurrentStock(),
                alert.getReorderPoint(),
                alert.getSeverity().name(),
                alert.getStatus().name(),
                alert.getCreatedAt(),
                alert.getResolvedAt()
        );
    }
}

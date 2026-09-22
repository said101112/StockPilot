package com.exmple.stockpilot.stockmovement.presentation;

import com.exmple.stockpilot.stockmovement.domain.model.StockMovement;

import java.time.LocalDateTime;
import java.util.UUID;

public record StockMovementResponse(
        UUID id,
        String movementNumber,
        UUID productId,
        UUID warehouseId,
        String type,
        int quantity,
        String referenceDocument,
        LocalDateTime timestamp
) {
    public static StockMovementResponse from(StockMovement m) {
        return new StockMovementResponse(
                m.getId().value(),
                m.getMovementNumber(),
                m.getProductId().value(),
                m.getWarehouseId().value(),
                m.getType().name(),
                m.getQuantity(),
                m.getReferenceDocument(),
                m.getTimestamp()
        );
    }
}

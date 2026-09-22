package com.exmple.stockpilot.stockmovement.application.port.in;

import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import com.exmple.stockpilot.stockmovement.presentation.StockMovementResponse;

import java.util.UUID;

public interface RecordStockMovementUseCase {
    StockMovementResponse recordMovement(
            UUID productId,
            UUID warehouseId,
            MovementType type,
            int quantity,
            String referenceDocument
    );
}

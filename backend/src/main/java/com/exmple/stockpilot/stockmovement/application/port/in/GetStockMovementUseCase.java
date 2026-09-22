package com.exmple.stockpilot.stockmovement.application.port.in;

import com.exmple.stockpilot.stockmovement.presentation.StockMovementResponse;

import java.util.List;
import java.util.UUID;

public interface GetStockMovementUseCase {
    List<StockMovementResponse> getAllMovements();
    List<StockMovementResponse> getMovementsByProductId(UUID productId);
}

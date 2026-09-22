package com.exmple.stockpilot.stockmovement.application.port.out;

import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockmovement.domain.model.StockMovement;
import com.exmple.stockpilot.stockmovement.domain.valueobject.StockMovementId;

import java.util.List;
import java.util.Optional;

public interface StockMovementRepository {

    StockMovement save(StockMovement movement);

    Optional<StockMovement> findById(StockMovementId id);

    List<StockMovement> findByProductId(ProductId productId);

    List<StockMovement> findAll();
}

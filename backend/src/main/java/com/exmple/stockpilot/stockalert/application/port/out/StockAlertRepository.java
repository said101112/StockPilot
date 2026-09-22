package com.exmple.stockpilot.stockalert.application.port.out;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockalert.domain.model.StockAlert;
import com.exmple.stockpilot.stockalert.domain.valueobject.StockAlertId;

import java.util.List;
import java.util.Optional;

public interface StockAlertRepository {

    StockAlert save(StockAlert alert);

    Optional<StockAlert> findById(StockAlertId id);

    Optional<StockAlert> findActiveByProductAndWarehouse(ProductId productId, WarehouseId warehouseId);

    List<StockAlert> findAllActive();

    List<StockAlert> findAll();
}

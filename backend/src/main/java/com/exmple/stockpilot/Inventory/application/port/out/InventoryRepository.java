package com.exmple.stockpilot.Inventory.application.port.out;

import com.exmple.stockpilot.Inventory.domain.model.Inventory;
import com.exmple.stockpilot.Inventory.domain.valueObject.InventoryId;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository {
    Inventory save(Inventory inventory);
    Optional<Inventory> findByProductIdAndWarehouseId(ProductId productId, WarehouseId warehouseId);
    Optional<Inventory> findById(InventoryId inventoryId);
    List<Inventory> findAll();
}

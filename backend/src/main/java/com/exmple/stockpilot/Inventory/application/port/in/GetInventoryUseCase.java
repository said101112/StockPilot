package com.exmple.stockpilot.Inventory.application.port.in;

import com.exmple.stockpilot.Inventory.presentation.InventoryResponse;

import java.util.List;
import java.util.UUID;

public interface GetInventoryUseCase {
    List<InventoryResponse> getAllInventories();
    InventoryResponse getInventoryById(UUID id);
    InventoryResponse getInventoryByProductAndWarehouse(UUID productId, UUID warehouseId);
}

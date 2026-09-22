package com.exmple.stockpilot.Inventory.application.port.in;

import com.exmple.stockpilot.Inventory.presentation.InventoryResponse;
import com.exmple.stockpilot.Inventory.presentation.ScrapInventoryResponse;
import com.exmple.stockpilot.Inventory.presentation.ScrapStockRequest;

import java.util.UUID;

public interface ManageInventoryUseCase {
    InventoryResponse consumeStock(UUID inventoryId, int quantity);
    InventoryResponse reserveStock(UUID inventoryId, int quantity);
    InventoryResponse increaseStock(UUID inventoryId, int quantity);
    ScrapInventoryResponse scrapStock(UUID inventoryId, ScrapStockRequest request);
}

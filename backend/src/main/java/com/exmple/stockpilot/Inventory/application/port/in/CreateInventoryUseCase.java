package com.exmple.stockpilot.Inventory.application.port.in;

import com.exmple.stockpilot.Inventory.presentation.CreateInventoryRequest;
import com.exmple.stockpilot.Inventory.presentation.InventoryResponse;

public interface CreateInventoryUseCase {
    InventoryResponse createInventory(CreateInventoryRequest request);
}

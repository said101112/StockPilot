package com.exmple.stockpilot.Inventory.presentation;

import com.exmple.stockpilot.Inventory.domain.model.Inventory;

import java.util.UUID;

public record InventoryResponse(
        UUID id,
        UUID productId,
        UUID warehouseId,
        int quantityOnHand,
        int reservedQuantity,
        int availableQuantity,
        int reorderPoint,
        String status
) {
    public static InventoryResponse from(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId().value(),
                inventory.getProductId().value(),
                inventory.getWarehouseId().value(),
                inventory.getQuantityOnHand(),
                inventory.getReservedQuantity(),
                inventory.getAvailableQuantity(),
                inventory.getReorderPoint(),
                inventory.getStatus().name()
        );
    }
}

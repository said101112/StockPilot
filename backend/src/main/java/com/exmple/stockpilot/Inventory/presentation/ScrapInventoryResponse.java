package com.exmple.stockpilot.Inventory.presentation;

import com.exmple.stockpilot.Inventory.domain.model.Inventory;

import java.util.UUID;

/**
 * Réponse retournée après une opération de mise au rebut / déclaration de pièce cassée (SAP MM 551).
 */
public record ScrapInventoryResponse(
        UUID inventoryId,
        UUID productId,
        UUID warehouseId,
        int quantityScrapped,
        int remainingStock,
        int remainingAvailable,
        int reorderPoint,
        String status,
        String movementNumber,
        String scrapReason,
        String operator,
        boolean alertTriggered
) {
    public static ScrapInventoryResponse from(
            Inventory inventory,
            int quantityScrapped,
            String movementNumber,
            String scrapReason,
            String operator,
            boolean alertTriggered
    ) {
        return new ScrapInventoryResponse(
                inventory.getId().value(),
                inventory.getProductId().value(),
                inventory.getWarehouseId().value(),
                quantityScrapped,
                inventory.getQuantityOnHand(),
                inventory.getAvailableQuantity(),
                inventory.getReorderPoint(),
                inventory.getStatus().name(),
                movementNumber,
                scrapReason,
                operator,
                alertTriggered
        );
    }
}

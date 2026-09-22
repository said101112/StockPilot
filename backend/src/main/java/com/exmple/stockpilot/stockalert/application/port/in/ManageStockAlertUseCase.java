package com.exmple.stockpilot.stockalert.application.port.in;

import java.util.UUID;

public interface ManageStockAlertUseCase {
    void checkAndTriggerAlert(UUID productId, UUID warehouseId, int availableQuantity, int reorderPoint);
    void resolveAlertIfAny(UUID productId, UUID warehouseId);
}

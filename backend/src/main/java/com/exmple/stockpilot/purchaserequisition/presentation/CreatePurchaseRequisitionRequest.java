package com.exmple.stockpilot.purchaserequisition.presentation;

import java.time.LocalDate;

public record CreatePurchaseRequisitionRequest(
        String productId,
        String warehouseId,
        int requestedQuantity,
        LocalDate requestedDeliveryDate,
        String justification
) {
}

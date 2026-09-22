package com.exmple.stockpilot.purchaseorder.presentation;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePurchaseOrderFromRequisitionRequest(
        String requisitionId,
        String supplierId,
        BigDecimal negotiatedUnitPrice,
        LocalDate expectedDeliveryDate
) {
}

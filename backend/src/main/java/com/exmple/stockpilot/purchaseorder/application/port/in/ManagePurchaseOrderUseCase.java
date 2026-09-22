package com.exmple.stockpilot.purchaseorder.application.port.in;

import com.exmple.stockpilot.purchaseorder.presentation.PurchaseOrderResponse;

import java.util.UUID;

public interface ManagePurchaseOrderUseCase {
    PurchaseOrderResponse issueOrder(UUID id);
    PurchaseOrderResponse cancelOrder(UUID id);
    PurchaseOrderResponse recordReceiptProgress(UUID poId, UUID productId, int receivedQuantity);
}

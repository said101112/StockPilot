package com.exmple.stockpilot.purchaseorder.application.port.in;

import com.exmple.stockpilot.purchaseorder.presentation.CreatePurchaseOrderFromRequisitionRequest;
import com.exmple.stockpilot.purchaseorder.presentation.PurchaseOrderResponse;

public interface CreatePurchaseOrderUseCase {
    PurchaseOrderResponse createFromRequisition(CreatePurchaseOrderFromRequisitionRequest request);
}

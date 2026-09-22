package com.exmple.stockpilot.purchaserequisition.application.port.in;

import com.exmple.stockpilot.purchaserequisition.presentation.CreatePurchaseRequisitionRequest;
import com.exmple.stockpilot.purchaserequisition.presentation.PurchaseRequisitionResponse;

public interface CreatePurchaseRequisitionUseCase {
    PurchaseRequisitionResponse createRequisition(CreatePurchaseRequisitionRequest request);
}

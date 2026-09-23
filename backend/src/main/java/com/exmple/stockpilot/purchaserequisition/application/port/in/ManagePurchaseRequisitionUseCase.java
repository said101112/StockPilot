package com.exmple.stockpilot.purchaserequisition.application.port.in;

import com.exmple.stockpilot.purchaserequisition.presentation.PurchaseRequisitionResponse;

import java.util.UUID;

public interface ManagePurchaseRequisitionUseCase {
    PurchaseRequisitionResponse submitRequisition(UUID id);
    PurchaseRequisitionResponse approveRequisition(UUID id);
    PurchaseRequisitionResponse rejectRequisition(UUID id, String reason);
    void deleteRequisition(UUID id);
}

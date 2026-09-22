package com.exmple.stockpilot.purchaserequisition.application.port.in;

import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
import com.exmple.stockpilot.purchaserequisition.presentation.PurchaseRequisitionResponse;

import java.util.List;
import java.util.UUID;

public interface GetPurchaseRequisitionUseCase {
    List<PurchaseRequisitionResponse> getAllRequisitions();
    List<PurchaseRequisitionResponse> getRequisitionsByStatus(PurchaseRequisitionStatus status);
    PurchaseRequisitionResponse getRequisitionById(UUID id);
}

package com.exmple.stockpilot.purchaserequisition.presentation;

import com.exmple.stockpilot.purchaserequisition.domain.model.PurchaseRequisition;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PurchaseRequisitionResponse(
        UUID id,
        String prNumber,
        UUID productId,
        UUID warehouseId,
        int requestedQuantity,
        LocalDate requestedDeliveryDate,
        String justification,
        String status,
        String rejectionReason,
        LocalDateTime createdAt,
        LocalDateTime submittedAt
) {
    public static PurchaseRequisitionResponse from(PurchaseRequisition pr) {
        return new PurchaseRequisitionResponse(
                pr.getId().value(),
                pr.getPrNumber(),
                pr.getProductId().value(),
                pr.getWarehouseId().value(),
                pr.getRequestedQuantity(),
                pr.getRequestedDeliveryDate(),
                pr.getJustification(),
                pr.getStatus().name(),
                pr.getRejectionReason(),
                pr.getCreatedAt(),
                pr.getSubmittedAt()
        );
    }
}

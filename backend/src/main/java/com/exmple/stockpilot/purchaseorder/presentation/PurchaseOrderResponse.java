package com.exmple.stockpilot.purchaseorder.presentation;

import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PurchaseOrderResponse(
        UUID id,
        String poNumber,
        UUID requisitionId,
        UUID supplierId,
        UUID warehouseId,
        List<PurchaseOrderItemResponse> items,
        BigDecimal totalAmount,
        String currency,
        String status,
        LocalDate expectedDeliveryDate,
        String paymentTerms,
        LocalDateTime createdAt,
        LocalDateTime issuedAt
) {
    public static PurchaseOrderResponse from(PurchaseOrder po) {
        List<PurchaseOrderItemResponse> itemResponses = po.getItems().stream()
                .map(PurchaseOrderItemResponse::from)
                .toList();

        return new PurchaseOrderResponse(
                po.getId().value(),
                po.getPoNumber(),
                po.getRequisitionId() != null ? po.getRequisitionId().value() : null,
                po.getSupplierId().value(),
                po.getWarehouseId().value(),
                itemResponses,
                po.getTotalAmount(),
                po.getCurrency(),
                po.getStatus().name(),
                po.getExpectedDeliveryDate(),
                po.getPaymentTerms(),
                po.getCreatedAt(),
                po.getIssuedAt()
        );
    }
}

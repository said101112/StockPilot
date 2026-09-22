package com.exmple.stockpilot.goodsreceipt.presentation;

import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceipt;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record GoodsReceiptResponse(
        UUID id,
        String grNumber,
        UUID purchaseOrderId,
        String deliveryNoteNumber,
        List<GoodsReceiptItemResponse> items,
        LocalDateTime receivedAt,
        String notes
) {
    public static GoodsReceiptResponse from(GoodsReceipt gr) {
        return new GoodsReceiptResponse(
                gr.getId().value(),
                gr.getGrNumber(),
                gr.getPurchaseOrderId().value(),
                gr.getDeliveryNoteNumber(),
                gr.getItems().stream().map(GoodsReceiptItemResponse::from).toList(),
                gr.getReceivedAt(),
                gr.getNotes()
        );
    }
}

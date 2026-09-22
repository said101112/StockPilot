package com.exmple.stockpilot.goodsreceipt.presentation;

import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceiptItem;

import java.util.UUID;

public record GoodsReceiptItemResponse(
        UUID id,
        UUID productId,
        String productName,
        String sku,
        int receivedQuantity
) {
    public static GoodsReceiptItemResponse from(GoodsReceiptItem item) {
        return new GoodsReceiptItemResponse(
                item.getId(),
                item.getProductId().value(),
                item.getProductName(),
                item.getSku(),
                item.getReceivedQuantity()
        );
    }
}

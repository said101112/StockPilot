package com.exmple.stockpilot.goodsreceipt.presentation;

import java.util.List;
import java.util.UUID;

public record CreateGoodsReceiptRequest(
        UUID purchaseOrderId,
        String deliveryNoteNumber,
        List<GoodsReceiptItemRequest> items,
        String notes
) {}

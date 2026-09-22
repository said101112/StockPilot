package com.exmple.stockpilot.goodsreceipt.presentation;

import java.util.UUID;

public record GoodsReceiptItemRequest(
        UUID productId,
        int receivedQuantity
) {}

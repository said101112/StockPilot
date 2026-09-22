package com.exmple.stockpilot.goodsreceipt.domain.valueobject;

import java.util.Objects;
import java.util.UUID;

public record GoodsReceiptId(UUID value) {
    public GoodsReceiptId {
        Objects.requireNonNull(value, "GoodsReceiptId cannot be null");
    }

    public static GoodsReceiptId generate() {
        return new GoodsReceiptId(UUID.randomUUID());
    }

    public static GoodsReceiptId from(UUID value) {
        return new GoodsReceiptId(value);
    }
}

package com.exmple.stockpilot.purchaseorder.domain.valueobject;

import java.util.Objects;
import java.util.UUID;

public record PurchaseOrderId(UUID value) {
    public PurchaseOrderId {
        Objects.requireNonNull(value, "PurchaseOrderId cannot be null");
    }

    public static PurchaseOrderId generate() {
        return new PurchaseOrderId(UUID.randomUUID());
    }

    public static PurchaseOrderId from(UUID value) {
        return new PurchaseOrderId(value);
    }
}

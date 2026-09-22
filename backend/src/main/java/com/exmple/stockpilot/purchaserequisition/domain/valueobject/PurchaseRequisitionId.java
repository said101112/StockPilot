package com.exmple.stockpilot.purchaserequisition.domain.valueobject;

import java.util.Objects;
import java.util.UUID;

public record PurchaseRequisitionId(UUID value) {
    public PurchaseRequisitionId {
        Objects.requireNonNull(value, "PurchaseRequisitionId cannot be null");
    }

    public static PurchaseRequisitionId generate() {
        return new PurchaseRequisitionId(UUID.randomUUID());
    }

    public static PurchaseRequisitionId from(UUID value) {
        return new PurchaseRequisitionId(value);
    }
}

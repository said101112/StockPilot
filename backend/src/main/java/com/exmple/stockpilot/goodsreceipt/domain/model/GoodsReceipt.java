package com.exmple.stockpilot.goodsreceipt.domain.model;

import com.exmple.stockpilot.goodsreceipt.domain.valueobject.GoodsReceiptId;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Entité Racine d'Agrégat Bon de Réception Marchandise (Goods Receipt / MIGO).
 * Atteste de l'entrée physique des marchandises dans l'entrepôt.
 */
public class GoodsReceipt {

    private final GoodsReceiptId id;
    private final String grNumber;
    private final PurchaseOrderId purchaseOrderId;
    private final String deliveryNoteNumber;
    private final List<GoodsReceiptItem> items;
    private final LocalDateTime receivedAt;
    private final String notes;

    public GoodsReceipt(
            GoodsReceiptId id,
            String grNumber,
            PurchaseOrderId purchaseOrderId,
            String deliveryNoteNumber,
            List<GoodsReceiptItem> items,
            LocalDateTime receivedAt,
            String notes
    ) {
        this.id = Objects.requireNonNull(id, "GoodsReceiptId cannot be null");
        if (grNumber == null || grNumber.isBlank()) {
            throw new IllegalArgumentException("GR number cannot be empty");
        }
        this.grNumber = grNumber.trim();
        this.purchaseOrderId = Objects.requireNonNull(purchaseOrderId, "PurchaseOrderId cannot be null");
        if (deliveryNoteNumber == null || deliveryNoteNumber.isBlank()) {
            throw new IllegalArgumentException("Delivery note number (BL) cannot be empty");
        }
        this.deliveryNoteNumber = deliveryNoteNumber.trim();
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Goods receipt must contain at least one item");
        }
        this.items = new ArrayList<>(items);
        this.receivedAt = receivedAt != null ? receivedAt : LocalDateTime.now();
        this.notes = notes != null ? notes.trim() : "";
    }

    public static GoodsReceipt create(
            String grNumber,
            PurchaseOrderId purchaseOrderId,
            String deliveryNoteNumber,
            List<GoodsReceiptItem> items,
            String notes
    ) {
        return new GoodsReceipt(
                GoodsReceiptId.generate(),
                grNumber,
                purchaseOrderId,
                deliveryNoteNumber,
                items,
                LocalDateTime.now(),
                notes
        );
    }

    public GoodsReceiptId getId() {
        return id;
    }

    public String getGrNumber() {
        return grNumber;
    }

    public PurchaseOrderId getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public String getDeliveryNoteNumber() {
        return deliveryNoteNumber;
    }

    public List<GoodsReceiptItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public String getNotes() {
        return notes;
    }
}

package com.exmple.stockpilot.goodsreceipt.infrastructure.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "goods_receipts")
public class GoodsReceiptJpaEntity {

    @Id
    private UUID id;

    @Column(name = "gr_number", nullable = false, unique = true)
    private String grNumber;

    @Column(name = "purchase_order_id", nullable = false)
    private UUID purchaseOrderId;

    @Column(name = "delivery_note_number", nullable = false)
    private String deliveryNoteNumber;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    @Column(name = "notes")
    private String notes;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "receipt_id")
    private List<GoodsReceiptItemJpaEntity> items = new ArrayList<>();

    public GoodsReceiptJpaEntity() {}

    public GoodsReceiptJpaEntity(
            UUID id,
            String grNumber,
            UUID purchaseOrderId,
            String deliveryNoteNumber,
            LocalDateTime receivedAt,
            String notes,
            List<GoodsReceiptItemJpaEntity> items
    ) {
        this.id = id;
        this.grNumber = grNumber;
        this.purchaseOrderId = purchaseOrderId;
        this.deliveryNoteNumber = deliveryNoteNumber;
        this.receivedAt = receivedAt;
        this.notes = notes;
        this.items = items != null ? items : new ArrayList<>();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getGrNumber() {
        return grNumber;
    }

    public void setGrNumber(String grNumber) {
        this.grNumber = grNumber;
    }

    public UUID getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(UUID purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
    }

    public String getDeliveryNoteNumber() {
        return deliveryNoteNumber;
    }

    public void setDeliveryNoteNumber(String deliveryNoteNumber) {
        this.deliveryNoteNumber = deliveryNoteNumber;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<GoodsReceiptItemJpaEntity> getItems() {
        return items;
    }

    public void setItems(List<GoodsReceiptItemJpaEntity> items) {
        this.items = items;
    }
}

package com.exmple.stockpilot.purchaseorder.infrastructure.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrderJpaEntity {

    @Id
    private UUID id;

    @Column(name = "po_number", nullable = false, unique = true)
    private String poNumber;

    @Column(name = "requisition_id")
    private UUID requisitionId;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<PurchaseOrderItemJpaEntity> items = new ArrayList<>();

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String status;

    @Column(name = "expected_delivery_date", nullable = false)
    private LocalDate expectedDeliveryDate;

    @Column(name = "payment_terms", nullable = false)
    private String paymentTerms;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    public PurchaseOrderJpaEntity() {
    }

    public PurchaseOrderJpaEntity(
            UUID id,
            String poNumber,
            UUID requisitionId,
            UUID supplierId,
            UUID warehouseId,
            List<PurchaseOrderItemJpaEntity> items,
            BigDecimal totalAmount,
            String currency,
            String status,
            LocalDate expectedDeliveryDate,
            String paymentTerms,
            LocalDateTime createdAt,
            LocalDateTime issuedAt
    ) {
        this.id = id;
        this.poNumber = poNumber;
        this.requisitionId = requisitionId;
        this.supplierId = supplierId;
        this.warehouseId = warehouseId;
        this.items = items != null ? items : new ArrayList<>();
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.status = status;
        this.expectedDeliveryDate = expectedDeliveryDate;
        this.paymentTerms = paymentTerms;
        this.createdAt = createdAt;
        this.issuedAt = issuedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public UUID getRequisitionId() { return requisitionId; }
    public void setRequisitionId(UUID requisitionId) { this.requisitionId = requisitionId; }

    public UUID getSupplierId() { return supplierId; }
    public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }

    public UUID getWarehouseId() { return warehouseId; }
    public void setWarehouseId(UUID warehouseId) { this.warehouseId = warehouseId; }

    public List<PurchaseOrderItemJpaEntity> getItems() { return items; }
    public void setItems(List<PurchaseOrderItemJpaEntity> items) { this.items = items; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
}

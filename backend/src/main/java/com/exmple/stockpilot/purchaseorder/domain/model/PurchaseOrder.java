package com.exmple.stockpilot.purchaseorder.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Entité Racine d'Agrégat Bon de Commande Fournisseur (PO / Purchase Order).
 * Représente l'engagement juridique et contractuel auprès du fournisseur.
 */
public class PurchaseOrder {

    private final PurchaseOrderId id;
    private final String poNumber;
    private final PurchaseRequisitionId requisitionId;
    private final SupplierId supplierId;
    private final WarehouseId warehouseId;
    private final List<PurchaseOrderItem> items;
    private BigDecimal totalAmount;
    private final String currency;
    private PurchaseOrderStatus status;
    private LocalDate expectedDeliveryDate;
    private String paymentTerms;
    private final LocalDateTime createdAt;
    private LocalDateTime issuedAt;

    public PurchaseOrder(
            PurchaseOrderId id,
            String poNumber,
            PurchaseRequisitionId requisitionId,
            SupplierId supplierId,
            WarehouseId warehouseId,
            List<PurchaseOrderItem> items,
            BigDecimal totalAmount,
            String currency,
            PurchaseOrderStatus status,
            LocalDate expectedDeliveryDate,
            String paymentTerms,
            LocalDateTime createdAt,
            LocalDateTime issuedAt
    ) {
        this.id = Objects.requireNonNull(id, "PurchaseOrderId cannot be null");
        if (poNumber == null || poNumber.isBlank()) {
            throw new IllegalArgumentException("PO number cannot be empty");
        }
        this.poNumber = poNumber.trim();
        this.requisitionId = requisitionId; // Peut être null si commande directe
        this.supplierId = Objects.requireNonNull(supplierId, "SupplierId cannot be null");
        this.warehouseId = Objects.requireNonNull(warehouseId, "WarehouseId cannot be null");
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Purchase order must contain at least one item");
        }
        this.items = new ArrayList<>(items);
        this.currency = currency != null ? currency.trim().toUpperCase() : "EUR";
        this.status = status != null ? status : PurchaseOrderStatus.DRAFT;
        this.expectedDeliveryDate = expectedDeliveryDate != null ? expectedDeliveryDate : LocalDate.now().plusDays(10);
        this.paymentTerms = paymentTerms != null ? paymentTerms : "NET_30";
        this.totalAmount = calculateTotal(this.items);
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.issuedAt = issuedAt;
    }

    public static PurchaseOrder create(
            String poNumber,
            PurchaseRequisitionId requisitionId,
            SupplierId supplierId,
            WarehouseId warehouseId,
            List<PurchaseOrderItem> items,
            String currency,
            LocalDate expectedDeliveryDate,
            String paymentTerms
    ) {
        return new PurchaseOrder(
                PurchaseOrderId.generate(),
                poNumber,
                requisitionId,
                supplierId,
                warehouseId,
                items,
                null, // calculé automatiquement
                currency,
                PurchaseOrderStatus.DRAFT,
                expectedDeliveryDate,
                paymentTerms,
                LocalDateTime.now(),
                null
        );
    }

    private static BigDecimal calculateTotal(List<PurchaseOrderItem> items) {
        return items.stream()
                .map(PurchaseOrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // --- Règles Métier (Domaine) ---

    public void issue() {
        if (this.status != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException("Only a DRAFT order can be issued to the supplier. Current: " + this.status);
        }
        this.status = PurchaseOrderStatus.ISSUED;
        this.issuedAt = LocalDateTime.now();
    }

    public void recordReceipt(ProductId productId, int receivedQuantity) {
        if (this.status != PurchaseOrderStatus.ISSUED && this.status != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new IllegalStateException("Cannot receive goods on order with status: " + this.status);
        }

        PurchaseOrderItem item = this.items.stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Product " + productId + " does not belong to this purchase order"));

        item.recordReceipt(receivedQuantity);

        boolean allReceived = this.items.stream().allMatch(PurchaseOrderItem::isFullyReceived);
        if (allReceived) {
            this.status = PurchaseOrderStatus.COMPLETED;
        } else {
            this.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
        }
    }

    public void cancel() {
        boolean hasAnyReceipt = this.items.stream().anyMatch(i -> i.getReceivedQuantity() > 0);
        if (hasAnyReceipt) {
            throw new IllegalStateException("Cannot cancel an order that already has received goods");
        }
        this.status = PurchaseOrderStatus.CANCELLED;
    }

    // Getters
    public PurchaseOrderId getId() { return id; }
    public String getPoNumber() { return poNumber; }
    public PurchaseRequisitionId getRequisitionId() { return requisitionId; }
    public SupplierId getSupplierId() { return supplierId; }
    public WarehouseId getWarehouseId() { return warehouseId; }
    public List<PurchaseOrderItem> getItems() { return Collections.unmodifiableList(items); }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getCurrency() { return currency; }
    public PurchaseOrderStatus getStatus() { return status; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public String getPaymentTerms() { return paymentTerms; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
}

package com.exmple.stockpilot.purchaseorder.domain.model;

import com.exmple.stockpilot.product.domain.valueobject.ProductId;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

/**
 * Ligne d'article dans un Bon de Commande Fournisseur.
 */
public class PurchaseOrderItem {

    private final UUID id;
    private final ProductId productId;
    private final String productName;
    private final String sku;
    private final int orderedQuantity;
    private int receivedQuantity;
    private final BigDecimal unitPrice;
    private final BigDecimal totalPrice;

    public PurchaseOrderItem(
            UUID id,
            ProductId productId,
            String productName,
            String sku,
            int orderedQuantity,
            int receivedQuantity,
            BigDecimal unitPrice
    ) {
        this.id = id != null ? id : UUID.randomUUID();
        this.productId = Objects.requireNonNull(productId, "ProductId cannot be null");
        this.productName = Objects.requireNonNull(productName, "ProductName cannot be null");
        this.sku = Objects.requireNonNull(sku, "SKU cannot be null");
        if (orderedQuantity <= 0) {
            throw new IllegalArgumentException("Ordered quantity must be strictly positive");
        }
        this.orderedQuantity = orderedQuantity;
        if (receivedQuantity < 0 || receivedQuantity > orderedQuantity) {
            throw new IllegalArgumentException("Received quantity cannot be negative or exceed ordered quantity");
        }
        this.receivedQuantity = receivedQuantity;
        this.unitPrice = Objects.requireNonNull(unitPrice, "UnitPrice cannot be null");
        if (unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Unit price must be positive");
        }
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(orderedQuantity));
    }

    public static PurchaseOrderItem create(
            ProductId productId,
            String productName,
            String sku,
            int orderedQuantity,
            BigDecimal unitPrice
    ) {
        return new PurchaseOrderItem(
                UUID.randomUUID(),
                productId,
                productName,
                sku,
                orderedQuantity,
                0,
                unitPrice
        );
    }

    // Règle métier : réception progressive de marchandise
    public void recordReceipt(int quantityToReceive) {
        if (quantityToReceive <= 0) {
            throw new IllegalArgumentException("Received quantity must be positive");
        }
        if (this.receivedQuantity + quantityToReceive > this.orderedQuantity) {
            throw new IllegalStateException("Cannot receive more than ordered: remaining to receive is " 
                    + (this.orderedQuantity - this.receivedQuantity));
        }
        this.receivedQuantity += quantityToReceive;
    }

    public boolean isFullyReceived() {
        return this.receivedQuantity >= this.orderedQuantity;
    }

    public int getRemainingQuantity() {
        return this.orderedQuantity - this.receivedQuantity;
    }

    // Getters
    public UUID getId() { return id; }
    public ProductId getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getSku() { return sku; }
    public int getOrderedQuantity() { return orderedQuantity; }
    public int getReceivedQuantity() { return receivedQuantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getTotalPrice() { return totalPrice; }
}

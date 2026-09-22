package com.exmple.stockpilot.goodsreceipt.domain.model;

import com.exmple.stockpilot.product.domain.valueobject.ProductId;

import java.util.Objects;
import java.util.UUID;

/**
 * Ligne d'article réceptionné dans le Bon de Réception (Goods Receipt / MIGO).
 */
public class GoodsReceiptItem {

    private final UUID id;
    private final ProductId productId;
    private final String productName;
    private final String sku;
    private final int receivedQuantity;

    public GoodsReceiptItem(UUID id, ProductId productId, String productName, String sku, int receivedQuantity) {
        this.id = id != null ? id : UUID.randomUUID();
        this.productId = Objects.requireNonNull(productId, "ProductId cannot be null");
        this.productName = Objects.requireNonNull(productName, "ProductName cannot be null");
        this.sku = Objects.requireNonNull(sku, "SKU cannot be null");
        if (receivedQuantity <= 0) {
            throw new IllegalArgumentException("Received quantity must be strictly positive");
        }
        this.receivedQuantity = receivedQuantity;
    }

    public static GoodsReceiptItem create(ProductId productId, String productName, String sku, int receivedQuantity) {
        return new GoodsReceiptItem(UUID.randomUUID(), productId, productName, sku, receivedQuantity);
    }

    public UUID getId() {
        return id;
    }

    public ProductId getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getSku() {
        return sku;
    }

    public int getReceivedQuantity() {
        return receivedQuantity;
    }
}

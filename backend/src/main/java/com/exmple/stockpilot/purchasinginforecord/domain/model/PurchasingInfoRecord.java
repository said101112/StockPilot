package com.exmple.stockpilot.purchasinginforecord.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;
import java.util.UUID;

/**
 * Agrégat Fiche Info Achat (Purchasing Info Record - PIR / SAP MM).
 * Établit la relation contractuelle entre un Article et un Fournisseur :
 * - Réf fournisseur (Vendor Part Number)
 * - Prix négocié de base & devise
 * - Paliers de remise dégressive (Volume Discount)
 * - Délai de livraison standard (Lead Time en jours)
 * - Quantité minimale de commande (MOQ)
 */
public class PurchasingInfoRecord {

    private final UUID id;
    private final UUID productId;
    private final UUID supplierId;
    private String supplierPartNumber;
    private BigDecimal baseUnitPrice;
    private String currency;
    private int leadTimeDays;
    private int minOrderQuantity;
    private int discountTierQuantity;
    private BigDecimal discountPercentage;
    private boolean preferred;
    private boolean active;

    public PurchasingInfoRecord(
            UUID id,
            UUID productId,
            UUID supplierId,
            String supplierPartNumber,
            BigDecimal baseUnitPrice,
            String currency,
            int leadTimeDays,
            int minOrderQuantity,
            int discountTierQuantity,
            BigDecimal discountPercentage,
            boolean preferred,
            boolean active
    ) {
        this.id = id != null ? id : UUID.randomUUID();
        this.productId = Objects.requireNonNull(productId, "ProductId cannot be null");
        this.supplierId = Objects.requireNonNull(supplierId, "SupplierId cannot be null");
        this.supplierPartNumber = supplierPartNumber != null ? supplierPartNumber.trim() : "";
        if (baseUnitPrice == null || baseUnitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Base unit price must be strictly positive");
        }
        this.baseUnitPrice = baseUnitPrice;
        this.currency = currency != null && !currency.isBlank() ? currency.trim().toUpperCase() : "EUR";
        this.leadTimeDays = Math.max(1, leadTimeDays);
        this.minOrderQuantity = Math.max(1, minOrderQuantity);
        this.discountTierQuantity = Math.max(0, discountTierQuantity);
        this.discountPercentage = discountPercentage != null ? discountPercentage : BigDecimal.ZERO;
        this.preferred = preferred;
        this.active = active;
    }

    public static PurchasingInfoRecord create(
            UUID productId,
            UUID supplierId,
            String supplierPartNumber,
            BigDecimal baseUnitPrice,
            String currency,
            int leadTimeDays,
            int minOrderQuantity,
            int discountTierQuantity,
            BigDecimal discountPercentage,
            boolean preferred
    ) {
        return new PurchasingInfoRecord(
                UUID.randomUUID(),
                productId,
                supplierId,
                supplierPartNumber,
                baseUnitPrice,
                currency,
                leadTimeDays,
                minOrderQuantity,
                discountTierQuantity,
                discountPercentage,
                preferred,
                true
        );
    }

    /**
     * Calcule le prix effectif unitaire en tenant compte du palier dégressif.
     */
    public BigDecimal calculateEffectiveUnitPrice(int quantity) {
        if (discountTierQuantity > 0 && quantity >= discountTierQuantity && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal factor = BigDecimal.ONE.subtract(discountPercentage.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            return baseUnitPrice.multiply(factor).setScale(2, RoundingMode.HALF_UP);
        }
        return baseUnitPrice;
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public UUID getSupplierId() { return supplierId; }
    public String getSupplierPartNumber() { return supplierPartNumber; }
    public BigDecimal getBaseUnitPrice() { return baseUnitPrice; }
    public String getCurrency() { return currency; }
    public int getLeadTimeDays() { return leadTimeDays; }
    public int getMinOrderQuantity() { return minOrderQuantity; }
    public int getDiscountTierQuantity() { return discountTierQuantity; }
    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public boolean isPreferred() { return preferred; }
    public boolean isActive() { return active; }

    public void setPreferred(boolean preferred) { this.preferred = preferred; }
    public void setActive(boolean active) { this.active = active; }
}

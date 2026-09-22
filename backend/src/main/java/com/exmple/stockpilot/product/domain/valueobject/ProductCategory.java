package com.exmple.stockpilot.product.domain.valueobject;

/**
 * Catégorie d'article standard inspirée des types d'articles SAP MM (Material Types : ROH, FERT, etc.)
 */
public enum ProductCategory {
    RAW_MATERIAL,      // Matière première (ex: acier, plastique)
    FINISHED_GOOD,     // Produit fini (ex: écran, ordinateur)
    SPARE_PART,        // Pièce détachée / de rechange
    CONSUMABLE,        // Consommable (ex: papier, toner)
    SERVICE;           // Prestation ou service

    public static ProductCategory fromString(String value) {
        if (value == null || value.isBlank()) {
            return FINISHED_GOOD; // Valeur par défaut
        }
        try {
            return ProductCategory.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return FINISHED_GOOD;
        }
    }
}

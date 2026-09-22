package com.exmple.stockpilot.purchaseorder.domain.enums;

/**
 * Statuts du cycle de vie d'un Bon de Commande Fournisseur (Purchase Order - PO).
 */
public enum PurchaseOrderStatus {
    DRAFT,                 // En cours de préparation par l'acheteur
    ISSUED,                // Émis et envoyé officiellement au fournisseur
    PARTIALLY_RECEIVED,    // Livraison partielle effectuée à l'entrepôt
    COMPLETED,             // Commande intégralement reçue au magasin
    CANCELLED              // Commande annulée
}

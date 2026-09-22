package com.exmple.stockpilot.purchaserequisition.domain.enums;

/**
 * États du cycle de vie d'une Demande d'Achat (DA / Purchase Requisition).
 */
public enum PurchaseRequisitionStatus {
    DRAFT,       // Brouillon en cours de rédaction par le magasinier
    SUBMITTED,   // Soumise officiellement à l'acheteur pour examen
    APPROVED,    // Approuvée par l'acheteur (prête pour transformation en bon de commande)
    ORDERED,     // Transformée en Bon de Commande Fournisseur (Purchase Order)
    REJECTED     // Rejetée par l'acheteur (ex: motif non valable ou doublon)
}

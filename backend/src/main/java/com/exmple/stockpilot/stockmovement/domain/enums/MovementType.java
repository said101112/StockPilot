package com.exmple.stockpilot.stockmovement.domain.enums;

/**
 * Types de mouvements de stock inspirés des Movement Types de SAP MM (ex: 101, 201, 561).
 */
public enum MovementType {
    GOODS_RECEIPT_PO,      // Entrée de marchandise sur commande d'achat (Équivalent SAP 101)
    INTERNAL_CONSUMPTION,  // Sortie de stock pour usage interne / atelier (Équivalent SAP 201)
    INITIAL_STOCK,         // Initialisation de l'inventaire en magasin (Équivalent SAP 561)
    MANUAL_ADJUSTMENT,     // Régularisation d'inventaire
    SCRAP_DAMAGED          // Sortie de stock pour mise au rebut / pièce cassée (Équivalent SAP 551)
}

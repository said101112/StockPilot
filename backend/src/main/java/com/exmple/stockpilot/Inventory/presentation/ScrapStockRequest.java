package com.exmple.stockpilot.Inventory.presentation;

/**
 * Requête pour déclarer la mise au rebut ou la casse d'une pièce en magasin (SAP MM 551).
 */
public record ScrapStockRequest(
        int quantity,
        String reason,
        String operator
) {
    public ScrapStockRequest {
        if (reason == null || reason.isBlank()) {
            reason = "Casse accidentelle / Déclassement";
        } else {
            reason = reason.trim();
        }
        if (operator == null || operator.isBlank()) {
            operator = "Magasinier";
        } else {
            operator = operator.trim();
        }
    }
}

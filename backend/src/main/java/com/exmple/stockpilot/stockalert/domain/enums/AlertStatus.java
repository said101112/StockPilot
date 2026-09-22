package com.exmple.stockpilot.stockalert.domain.enums;

public enum AlertStatus {
    ACTIVE,         // Alerte levée, nécessite action du magasinier
    IN_PROGRESS,    // Demande d'achat ou commande en cours pour cette alerte
    RESOLVED        // Le stock est remonté au-dessus du seuil
}

package com.exmple.stockpilot.stockalert.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockalert.domain.enums.AlertSeverity;
import com.exmple.stockpilot.stockalert.domain.enums.AlertStatus;
import com.exmple.stockpilot.stockalert.domain.valueobject.StockAlertId;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entité Métier représentant une Alerte de Stock Bas.
 * Déclenchée automatiquement dès que le stock disponible passe sous le point de réapprovisionnement.
 */
public class StockAlert {

    private final StockAlertId id;
    private final ProductId productId;
    private final WarehouseId warehouseId;
    private int currentStock;
    private int reorderPoint;
    private AlertSeverity severity;
    private AlertStatus status;
    private final LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public StockAlert(
            StockAlertId id,
            ProductId productId,
            WarehouseId warehouseId,
            int currentStock,
            int reorderPoint,
            AlertSeverity severity,
            AlertStatus status,
            LocalDateTime createdAt,
            LocalDateTime resolvedAt
    ) {
        this.id = Objects.requireNonNull(id, "StockAlertId cannot be null");
        this.productId = Objects.requireNonNull(productId, "ProductId cannot be null");
        this.warehouseId = Objects.requireNonNull(warehouseId, "WarehouseId cannot be null");
        this.currentStock = currentStock;
        this.reorderPoint = reorderPoint;
        this.severity = severity != null ? severity : calculateSeverity(currentStock, reorderPoint);
        this.status = status != null ? status : AlertStatus.ACTIVE;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.resolvedAt = resolvedAt;
    }

    public static StockAlert create(
            ProductId productId,
            WarehouseId warehouseId,
            int currentStock,
            int reorderPoint
    ) {
        AlertSeverity initialSeverity = calculateSeverity(currentStock, reorderPoint);
        return new StockAlert(
                StockAlertId.generate(),
                productId,
                warehouseId,
                currentStock,
                reorderPoint,
                initialSeverity,
                AlertStatus.ACTIVE,
                LocalDateTime.now(),
                null
        );
    }

    // Règle métier : calcul de la sévérité en fonction de la criticité du manque
    private static AlertSeverity calculateSeverity(int currentStock, int reorderPoint) {
        if (currentStock <= 0) {
            return AlertSeverity.CRITICAL; // Rupture totale
        }
        if (currentStock <= reorderPoint / 2) {
            return AlertSeverity.HIGH;     // Moins de la moitié du stock de sécurité
        }
        return AlertSeverity.MEDIUM;       // Stock sous le seuil mais pas encore à zéro
    }

    // Méthodes métier
    public void updateStockLevel(int newStock) {
        this.currentStock = newStock;
        if (newStock > this.reorderPoint) {
            resolve();
        } else {
            this.severity = calculateSeverity(newStock, this.reorderPoint);
        }
    }

    public void markInProgress() {
        if (this.status == AlertStatus.ACTIVE) {
            this.status = AlertStatus.IN_PROGRESS;
        }
    }

    public void resolve() {
        this.status = AlertStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
    }

    // Getters
    public StockAlertId getId() { return id; }
    public ProductId getProductId() { return productId; }
    public WarehouseId getWarehouseId() { return warehouseId; }
    public int getCurrentStock() { return currentStock; }
    public int getReorderPoint() { return reorderPoint; }
    public AlertSeverity getSeverity() { return severity; }
    public AlertStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
}

package com.exmple.stockpilot.stockalert.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockalert.domain.enums.AlertSeverity;
import com.exmple.stockpilot.stockalert.domain.enums.AlertStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("StockAlert Domain Model Tests")
class StockAlertTest {

    @Test
    @DisplayName("Should assign CRITICAL severity when current stock is zero or negative")
    void shouldAssignCriticalSeverityWhenOutOfStock() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        StockAlert alertZero = StockAlert.create(productId, warehouseId, 0, 50);
        assertEquals(AlertSeverity.CRITICAL, alertZero.getSeverity());
        assertEquals(AlertStatus.ACTIVE, alertZero.getStatus());

        StockAlert alertNegative = StockAlert.create(productId, warehouseId, -5, 50);
        assertEquals(AlertSeverity.CRITICAL, alertNegative.getSeverity());
    }

    @Test
    @DisplayName("Should assign HIGH severity when stock is at or below half of reorder point")
    void shouldAssignHighSeverityWhenBelowHalfReorderPoint() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        StockAlert alert = StockAlert.create(productId, warehouseId, 20, 50);
        assertEquals(AlertSeverity.HIGH, alert.getSeverity());
    }

    @Test
    @DisplayName("Should assign MEDIUM severity when stock is below reorder point but above half")
    void shouldAssignMediumSeverity() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        StockAlert alert = StockAlert.create(productId, warehouseId, 35, 50);
        assertEquals(AlertSeverity.MEDIUM, alert.getSeverity());
    }

    @Test
    @DisplayName("Should resolve alert automatically when updated stock exceeds reorder point")
    void shouldResolveAlertWhenStockReplenished() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        StockAlert alert = StockAlert.create(productId, warehouseId, 10, 50);
        assertEquals(AlertStatus.ACTIVE, alert.getStatus());
        assertNull(alert.getResolvedAt());

        // Stock goes up to 60 (> 50)
        alert.updateStockLevel(60);
        assertEquals(AlertStatus.RESOLVED, alert.getStatus());
        assertNotNull(alert.getResolvedAt());
    }

    @Test
    @DisplayName("Should transition from ACTIVE to IN_PROGRESS")
    void shouldMarkAlertInProgress() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        StockAlert alert = StockAlert.create(productId, warehouseId, 5, 20);
        alert.markInProgress();
        assertEquals(AlertStatus.IN_PROGRESS, alert.getStatus());
    }
}

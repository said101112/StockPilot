package com.exmple.stockpilot.Inventory.domain.model;

import com.exmple.stockpilot.Inventory.domain.enums.InventoryStatus;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InventoryTest {

    @Test
    @DisplayName("Devrait calculer correctement le statut initial du stock selon le seuil d'alerte")
    void shouldCalculateCorrectInitialStatus() {
        ProductId pid = ProductId.generate();
        WarehouseId wid = WarehouseId.generate();

        // 1. Stock suffisant (100 > seuil 20) -> IN_STOCK
        Inventory invHigh = Inventory.create(pid, wid, 100, 20);
        assertThat(invHigh.getStatus()).isEqualTo(InventoryStatus.IN_STOCK);
        assertThat(invHigh.isBelowReorderPoint()).isFalse();
        assertThat(invHigh.isOutOfStock()).isFalse();

        // 2. Stock sous ou au seuil (15 <= seuil 20) -> LOW_STOCK
        Inventory invLow = Inventory.create(pid, wid, 15, 20);
        assertThat(invLow.getStatus()).isEqualTo(InventoryStatus.LOW_STOCK);
        assertThat(invLow.isBelowReorderPoint()).isTrue();
        assertThat(invLow.isOutOfStock()).isFalse();

        // 3. Stock nul (0) -> OUT_OF_STOCK
        Inventory invZero = Inventory.create(pid, wid, 0, 20);
        assertThat(invZero.getStatus()).isEqualTo(InventoryStatus.OUT_OF_STOCK);
        assertThat(invZero.isBelowReorderPoint()).isTrue();
        assertThat(invZero.isOutOfStock()).isTrue();
    }

    @Test
    @DisplayName("Devrait augmenter le stock disponible et actualiser le statut")
    void shouldIncreaseStock() {
        Inventory inv = Inventory.create(ProductId.generate(), WarehouseId.generate(), 5, 10);
        assertThat(inv.getStatus()).isEqualTo(InventoryStatus.LOW_STOCK);

        inv.increaseStock(20);
        assertThat(inv.getQuantityOnHand()).isEqualTo(25);
        assertThat(inv.getStatus()).isEqualTo(InventoryStatus.IN_STOCK);

        assertThatThrownBy(() -> inv.increaseStock(0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Quantity must be positive");
    }

    @Test
    @DisplayName("Devrait consommer du stock et interdire la surconsommation (stock négatif)")
    void shouldConsumeStockAndPreventNegativeStock() {
        Inventory inv = Inventory.create(ProductId.generate(), WarehouseId.generate(), 30, 10);

        inv.consumeStock(10);
        assertThat(inv.getQuantityOnHand()).isEqualTo(20);

        // Tentative de consommer plus que le stock physique (25 > 20)
        assertThatThrownBy(() -> inv.consumeStock(25))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Not enough stock to consume");
    }

    @Test
    @DisplayName("Devrait réserver puis libérer du stock")
    void shouldReserveAndReleaseStock() {
        Inventory inv = Inventory.create(ProductId.generate(), WarehouseId.generate(), 50, 10);

        inv.reserveStock(20);
        assertThat(inv.getReservedQuantity()).isEqualTo(20);
        assertThat(inv.getAvailableQuantity()).isEqualTo(30);

        inv.releaseStock(10);
        assertThat(inv.getReservedQuantity()).isEqualTo(10);
        assertThat(inv.getAvailableQuantity()).isEqualTo(40);

        // Impossible de libérer plus que ce qui est réservé
        assertThatThrownBy(() -> inv.releaseStock(50))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Not enough reserved stock to release");
    }

    @Test
    @DisplayName("Devrait rebuter (scrap) du stock détérioré et décrémenter le stock physique")
    void shouldScrapStock() {
        Inventory inv = Inventory.create(ProductId.generate(), WarehouseId.generate(), 40, 10);

        inv.scrapStock(5);
        assertThat(inv.getQuantityOnHand()).isEqualTo(35);
        assertThat(inv.getAvailableQuantity()).isEqualTo(35);

        // Impossible de rebuter plus que le stock disponible
        assertThatThrownBy(() -> inv.scrapStock(40))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Not enough available stock to scrap");
    }
}

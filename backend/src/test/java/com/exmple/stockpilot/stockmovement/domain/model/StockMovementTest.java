package com.exmple.stockpilot.stockmovement.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("StockMovement Domain Model Tests")
class StockMovementTest {

    @Test
    @DisplayName("Should create stock movement successfully with valid parameters")
    void shouldCreateStockMovementSuccessfully() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        StockMovement movement = StockMovement.create(
                "SM-2026-001",
                productId,
                warehouseId,
                MovementType.GOODS_RECEIPT_PO,
                50,
                "PO-2026-001"
        );

        assertNotNull(movement.getId());
        assertEquals("SM-2026-001", movement.getMovementNumber());
        assertEquals(productId, movement.getProductId());
        assertEquals(warehouseId, movement.getWarehouseId());
        assertEquals(MovementType.GOODS_RECEIPT_PO, movement.getType());
        assertEquals(50, movement.getQuantity());
        assertEquals("PO-2026-001", movement.getReferenceDocument());
        assertNotNull(movement.getTimestamp());
    }

    @Test
    @DisplayName("Should reject blank or null movement number")
    void shouldRejectInvalidMovementNumber() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        assertThrows(IllegalArgumentException.class, () ->
                StockMovement.create(
                        "",
                        productId,
                        warehouseId,
                        MovementType.GOODS_RECEIPT_PO,
                        10,
                        "DOC-1"
                )
        );

        assertThrows(IllegalArgumentException.class, () ->
                StockMovement.create(
                        "   ",
                        productId,
                        warehouseId,
                        MovementType.GOODS_RECEIPT_PO,
                        10,
                        "DOC-1"
                )
        );
    }

    @Test
    @DisplayName("Should reject zero or negative quantity")
    void shouldRejectInvalidQuantity() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        assertThrows(IllegalArgumentException.class, () ->
                StockMovement.create(
                        "SM-001",
                        productId,
                        warehouseId,
                        MovementType.INTERNAL_CONSUMPTION,
                        0,
                        "DOC-1"
                )
        );

        assertThrows(IllegalArgumentException.class, () ->
                StockMovement.create(
                        "SM-001",
                        productId,
                        warehouseId,
                        MovementType.INTERNAL_CONSUMPTION,
                        -5,
                        "DOC-1"
                )
        );
    }

    @Test
    @DisplayName("Should reject null productId, warehouseId, or type")
    void shouldRejectNullRequiredAttributes() {
        ProductId productId = new ProductId(UUID.randomUUID());
        WarehouseId warehouseId = WarehouseId.generate();

        assertThrows(NullPointerException.class, () ->
                StockMovement.create("SM-001", null, warehouseId, MovementType.GOODS_RECEIPT_PO, 10, "DOC")
        );

        assertThrows(NullPointerException.class, () ->
                StockMovement.create("SM-001", productId, null, MovementType.GOODS_RECEIPT_PO, 10, "DOC")
        );

        assertThrows(NullPointerException.class, () ->
                StockMovement.create("SM-001", productId, warehouseId, null, 10, "DOC")
        );
    }
}

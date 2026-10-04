package com.exmple.stockpilot.goodsreceipt.domain.model;

import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("GoodsReceipt Domain Model Tests")
class GoodsReceiptTest {

    @Test
    @DisplayName("Should create goods receipt with valid items successfully")
    void shouldCreateGoodsReceiptSuccessfully() {
        PurchaseOrderId poId = PurchaseOrderId.generate();
        ProductId productId = new ProductId(UUID.randomUUID());

        GoodsReceiptItem item = GoodsReceiptItem.create(
                productId,
                "Bearing 608ZZ",
                "SKU-BRG-608",
                100
        );

        GoodsReceipt gr = GoodsReceipt.create(
                "GR-2026-001",
                poId,
                "BL-987654",
                List.of(item),
                "Livraison conforme et scellée"
        );

        assertNotNull(gr.getId());
        assertEquals("GR-2026-001", gr.getGrNumber());
        assertEquals(poId, gr.getPurchaseOrderId());
        assertEquals("BL-987654", gr.getDeliveryNoteNumber());
        assertEquals(1, gr.getItems().size());
        assertEquals(100, gr.getItems().get(0).getReceivedQuantity());
        assertEquals("Livraison conforme et scellée", gr.getNotes());
        assertNotNull(gr.getReceivedAt());
    }

    @Test
    @DisplayName("Should reject blank GR number or delivery note number")
    void shouldRejectBlankNumbers() {
        PurchaseOrderId poId = PurchaseOrderId.generate();
        GoodsReceiptItem item = GoodsReceiptItem.create(
                new ProductId(UUID.randomUUID()),
                "Product",
                "SKU-1",
                10
        );

        assertThrows(IllegalArgumentException.class, () ->
                GoodsReceipt.create("", poId, "BL-123", List.of(item), "")
        );

        assertThrows(IllegalArgumentException.class, () ->
                GoodsReceipt.create("GR-001", poId, "  ", List.of(item), "")
        );
    }

    @Test
    @DisplayName("Should reject goods receipt without items")
    void shouldRejectEmptyItemsList() {
        PurchaseOrderId poId = PurchaseOrderId.generate();

        assertThrows(IllegalArgumentException.class, () ->
                GoodsReceipt.create("GR-001", poId, "BL-123", Collections.emptyList(), "")
        );
    }

    @Test
    @DisplayName("Should reject item with zero or negative quantity")
    void shouldRejectInvalidItemQuantity() {
        ProductId productId = new ProductId(UUID.randomUUID());

        assertThrows(IllegalArgumentException.class, () ->
                GoodsReceiptItem.create(productId, "Bolt M8", "SKU-BOLT-M8", 0)
        );

        assertThrows(IllegalArgumentException.class, () ->
                GoodsReceiptItem.create(productId, "Bolt M8", "SKU-BOLT-M8", -5)
        );
    }
}

package com.exmple.stockpilot.purchaseorder.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PurchaseOrderTest {

    @Test
    @DisplayName("Devrait créer un Bon de Commande avec calcul automatique du montant total")
    void shouldCreatePurchaseOrderAndComputeTotal() {
        ProductId p1 = ProductId.generate();
        ProductId p2 = ProductId.generate();

        PurchaseOrderItem item1 = new PurchaseOrderItem(
                null, p1, "Article A", "SKU-A", 10, 0, new BigDecimal("25.00")
        );
        PurchaseOrderItem item2 = new PurchaseOrderItem(
                null, p2, "Article B", "SKU-B", 4, 0, new BigDecimal("50.00")
        );

        PurchaseOrder po = PurchaseOrder.create(
                "PO-2026-001",
                PurchaseRequisitionId.generate(),
                SupplierId.generate(),
                WarehouseId.generate(),
                List.of(item1, item2),
                "EUR",
                LocalDate.now().plusDays(14),
                "NET_30"
        );

        assertThat(po.getId()).isNotNull();
        assertThat(po.getPoNumber()).isEqualTo("PO-2026-001");
        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.DRAFT);
        assertThat(po.getItems()).hasSize(2);
        // (10 * 25) + (4 * 50) = 250 + 200 = 450.00
        assertThat(po.getTotalAmount()).isEqualByComparingTo("450.00");
    }

    @Test
    @DisplayName("Devrait émettre (ISSUE) le bon de commande au fournisseur")
    void shouldIssuePurchaseOrder() {
        PurchaseOrderItem item = new PurchaseOrderItem(
                null, ProductId.generate(), "Test", "SKU-T", 5, 0, new BigDecimal("10.00")
        );

        PurchaseOrder po = PurchaseOrder.create(
                "PO-2026-002",
                null,
                SupplierId.generate(),
                WarehouseId.generate(),
                List.of(item),
                "EUR",
                LocalDate.now().plusDays(7),
                "NET_30"
        );

        po.issue();
        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.ISSUED);
        assertThat(po.getIssuedAt()).isNotNull();

        // Impossible d'émettre à nouveau
        assertThatThrownBy(po::issue)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only a DRAFT order can be issued");
    }

    @Test
    @DisplayName("Devrait refuser la création d'un bon de commande sans article")
    void shouldRejectOrderWithoutItems() {
        assertThatThrownBy(() -> PurchaseOrder.create(
                "PO-EMPTY",
                null,
                SupplierId.generate(),
                WarehouseId.generate(),
                List.of(),
                "EUR",
                LocalDate.now(),
                "NET_30"
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Purchase order must contain at least one item");
    }

    @Test
    @DisplayName("Devrait mettre à jour le statut lors d'une réception partielle puis complète")
    void shouldRecordReceiptProgressively() {
        ProductId pId = ProductId.generate();
        PurchaseOrderItem item = new PurchaseOrderItem(
                null, pId, "Pièce mécanique", "SKU-MEC", 10, 0, new BigDecimal("30.00")
        );

        PurchaseOrder po = PurchaseOrder.create(
                "PO-2026-REC",
                null,
                SupplierId.generate(),
                WarehouseId.generate(),
                List.of(item),
                "EUR",
                LocalDate.now().plusDays(10),
                "NET_30"
        );

        po.issue();

        // Réception partielle de 4 unités
        po.recordReceipt(pId, 4);
        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.PARTIALLY_RECEIVED);

        // Réception du reliquat de 6 unités
        po.recordReceipt(pId, 6);
        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.COMPLETED);
    }
}

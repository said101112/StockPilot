package com.exmple.stockpilot.purchaserequisition.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PurchaseRequisitionTest {

    @Test
    @DisplayName("Devrait créer une Demande d'Achat valide à l'état DRAFT")
    void shouldCreateValidRequisition() {
        ProductId prodId = ProductId.generate();
        WarehouseId whId = WarehouseId.generate();

        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-001",
                prodId,
                whId,
                50,
                LocalDate.now().plusDays(10),
                "Réapprovisionnement stock de sécurité"
        );

        assertThat(pr.getId()).isNotNull();
        assertThat(pr.getPrNumber()).isEqualTo("PR-2026-001");
        assertThat(pr.getProductId()).isEqualTo(prodId);
        assertThat(pr.getWarehouseId()).isEqualTo(whId);
        assertThat(pr.getRequestedQuantity()).isEqualTo(50);
        assertThat(pr.getStatus()).isEqualTo(PurchaseRequisitionStatus.DRAFT);
        assertThat(pr.getJustification()).isEqualTo("Réapprovisionnement stock de sécurité");
    }

    @Test
    @DisplayName("Devrait refuser une quantité demandée inférieure ou égale à zéro")
    void shouldRejectZeroOrNegativeQuantity() {
        ProductId prodId = ProductId.generate();
        WarehouseId whId = WarehouseId.generate();

        assertThatThrownBy(() -> PurchaseRequisition.create("PR-002", prodId, whId, 0, LocalDate.now(), "Justif"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Requested quantity must be strictly positive");

        assertThatThrownBy(() -> PurchaseRequisition.create("PR-002", prodId, whId, -10, LocalDate.now(), "Justif"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Devrait suivre le cycle de vie normal : DRAFT -> SUBMITTED -> APPROVED -> ORDERED")
    void shouldFollowStandardApprovalWorkflow() {
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-WORKFLOW",
                ProductId.generate(),
                WarehouseId.generate(),
                20,
                LocalDate.now().plusDays(5),
                "Demande urgente"
        );

        assertThat(pr.getStatus()).isEqualTo(PurchaseRequisitionStatus.DRAFT);

        pr.submit();
        assertThat(pr.getStatus()).isEqualTo(PurchaseRequisitionStatus.SUBMITTED);
        assertThat(pr.getSubmittedAt()).isNotNull();

        pr.approve();
        assertThat(pr.getStatus()).isEqualTo(PurchaseRequisitionStatus.APPROVED);

        pr.markAsOrdered();
        assertThat(pr.getStatus()).isEqualTo(PurchaseRequisitionStatus.ORDERED);
    }

    @Test
    @DisplayName("Devrait rejeter la DA avec un motif explicite")
    void shouldRejectRequisitionWithReason() {
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-REJECT",
                ProductId.generate(),
                WarehouseId.generate(),
                100,
                LocalDate.now().plusDays(5),
                "Achat exceptionnel"
        );

        pr.submit();
        pr.reject("Dépassement du budget alloué pour le trimestre");

        assertThat(pr.getStatus()).isEqualTo(PurchaseRequisitionStatus.REJECTED);
        assertThat(pr.getRejectionReason()).isEqualTo("Dépassement du budget alloué pour le trimestre");
    }

    @Test
    @DisplayName("Devrait empêcher d'approuver une DA qui n'est pas encore soumise (DRAFT)")
    void shouldPreventApproveDraft() {
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-INVALID",
                ProductId.generate(),
                WarehouseId.generate(),
                10,
                LocalDate.now(),
                "Test"
        );

        assertThatThrownBy(pr::approve)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only a SUBMITTED requisition can be approved");
    }

    @Test
    @DisplayName("Devrait interdire la modification de quantité après soumission")
    void shouldPreventQuantityChangeAfterSubmission() {
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-QTY",
                ProductId.generate(),
                WarehouseId.generate(),
                15,
                LocalDate.now(),
                "Test"
        );

        pr.updateQuantity(25);
        assertThat(pr.getRequestedQuantity()).isEqualTo(25);

        pr.submit();

        assertThatThrownBy(() -> pr.updateQuantity(30))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot modify quantity once requisition is submitted");
    }
}

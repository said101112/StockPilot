package com.exmple.stockpilot.purchaserequisition.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entité Racine d'Agrégat Demande d'Achat (DA / Purchase Requisition).
 * Représente l'expression d'un besoin interne avant toute négociation ou commande fournisseur.
 */
public class PurchaseRequisition {

    private final PurchaseRequisitionId id;
    private final String prNumber;
    private final ProductId productId;
    private final WarehouseId warehouseId;
    private int requestedQuantity;
    private LocalDate requestedDeliveryDate;
    private String justification;
    private PurchaseRequisitionStatus status;
    private String rejectionReason;
    private final LocalDateTime createdAt;
    private LocalDateTime submittedAt;

    public PurchaseRequisition(
            PurchaseRequisitionId id,
            String prNumber,
            ProductId productId,
            WarehouseId warehouseId,
            int requestedQuantity,
            LocalDate requestedDeliveryDate,
            String justification,
            PurchaseRequisitionStatus status,
            String rejectionReason,
            LocalDateTime createdAt,
            LocalDateTime submittedAt
    ) {
        this.id = Objects.requireNonNull(id, "PurchaseRequisitionId cannot be null");
        if (prNumber == null || prNumber.isBlank()) {
            throw new IllegalArgumentException("PR number cannot be empty");
        }
        this.prNumber = prNumber.trim();
        this.productId = Objects.requireNonNull(productId, "ProductId cannot be null");
        this.warehouseId = Objects.requireNonNull(warehouseId, "WarehouseId cannot be null");
        if (requestedQuantity <= 0) {
            throw new IllegalArgumentException("Requested quantity must be strictly positive");
        }
        this.requestedQuantity = requestedQuantity;
        this.requestedDeliveryDate = requestedDeliveryDate != null ? requestedDeliveryDate : LocalDate.now().plusDays(7);
        this.justification = justification != null ? justification.trim() : "";
        this.status = status != null ? status : PurchaseRequisitionStatus.DRAFT;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.submittedAt = submittedAt;
    }

    public static PurchaseRequisition create(
            String prNumber,
            ProductId productId,
            WarehouseId warehouseId,
            int requestedQuantity,
            LocalDate requestedDeliveryDate,
            String justification
    ) {
        return new PurchaseRequisition(
                PurchaseRequisitionId.generate(),
                prNumber,
                productId,
                warehouseId,
                requestedQuantity,
                requestedDeliveryDate,
                justification,
                PurchaseRequisitionStatus.DRAFT,
                null,
                LocalDateTime.now(),
                null
        );
    }

    // --- Règles Métier & Transitions d'état (Machine d'états) ---

    public void submit() {
        if (this.status != PurchaseRequisitionStatus.DRAFT) {
            throw new IllegalStateException("Only a DRAFT requisition can be submitted. Current status: " + this.status);
        }
        this.status = PurchaseRequisitionStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
    }

    public void approve() {
        if (this.status != PurchaseRequisitionStatus.SUBMITTED) {
            throw new IllegalStateException("Only a SUBMITTED requisition can be approved. Current status: " + this.status);
        }
        this.status = PurchaseRequisitionStatus.APPROVED;
    }

    public void reject(String reason) {
        if (this.status != PurchaseRequisitionStatus.SUBMITTED) {
            throw new IllegalStateException("Only a SUBMITTED requisition can be rejected. Current status: " + this.status);
        }
        this.status = PurchaseRequisitionStatus.REJECTED;
        this.rejectionReason = reason != null ? reason.trim() : "Non spécifié";
    }

    public void markAsOrdered() {
        if (this.status != PurchaseRequisitionStatus.APPROVED) {
            throw new IllegalStateException("Requisition cannot be ordered unless it is APPROVED. Current status: " + this.status);
        }
        this.status = PurchaseRequisitionStatus.ORDERED;
    }

    public void updateQuantity(int newQuantity) {
        if (this.status != PurchaseRequisitionStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify quantity once requisition is submitted or processed");
        }
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Requested quantity must be positive");
        }
        this.requestedQuantity = newQuantity;
    }

    // Getters
    public PurchaseRequisitionId getId() { return id; }
    public String getPrNumber() { return prNumber; }
    public ProductId getProductId() { return productId; }
    public WarehouseId getWarehouseId() { return warehouseId; }
    public int getRequestedQuantity() { return requestedQuantity; }
    public LocalDate getRequestedDeliveryDate() { return requestedDeliveryDate; }
    public String getJustification() { return justification; }
    public PurchaseRequisitionStatus getStatus() { return status; }
    public String getRejectionReason() { return rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}

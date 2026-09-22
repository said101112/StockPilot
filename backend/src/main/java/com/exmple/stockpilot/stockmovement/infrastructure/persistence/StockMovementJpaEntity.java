package com.exmple.stockpilot.stockmovement.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
public class StockMovementJpaEntity {

    @Id
    private UUID id;

    @Column(name = "movement_number", nullable = false, unique = true)
    private String movementNumber;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "reference_document")
    private String referenceDocument;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public StockMovementJpaEntity() {
    }

    public StockMovementJpaEntity(
            UUID id,
            String movementNumber,
            UUID productId,
            UUID warehouseId,
            String type,
            int quantity,
            String referenceDocument,
            LocalDateTime timestamp
    ) {
        this.id = id;
        this.movementNumber = movementNumber;
        this.productId = productId;
        this.warehouseId = warehouseId;
        this.type = type;
        this.quantity = quantity;
        this.referenceDocument = referenceDocument;
        this.timestamp = timestamp;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getMovementNumber() { return movementNumber; }
    public void setMovementNumber(String movementNumber) { this.movementNumber = movementNumber; }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public UUID getWarehouseId() { return warehouseId; }
    public void setWarehouseId(UUID warehouseId) { this.warehouseId = warehouseId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getReferenceDocument() { return referenceDocument; }
    public void setReferenceDocument(String referenceDocument) { this.referenceDocument = referenceDocument; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

package com.exmple.stockpilot.stockmovement.domain.model;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import com.exmple.stockpilot.stockmovement.domain.valueobject.StockMovementId;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Journal d'audit immuable de mouvement de stock (Material Document dans SAP MM).
 * Toute variation physique de stock doit obligatoirement générer un StockMovement.
 */
public class StockMovement {

    private final StockMovementId id;
    private final String movementNumber;
    private final ProductId productId;
    private final WarehouseId warehouseId;
    private final MovementType type;
    private final int quantity;
    private final String referenceDocument;
    private final LocalDateTime timestamp;

    public StockMovement(
            StockMovementId id,
            String movementNumber,
            ProductId productId,
            WarehouseId warehouseId,
            MovementType type,
            int quantity,
            String referenceDocument,
            LocalDateTime timestamp
    ) {
        this.id = Objects.requireNonNull(id, "StockMovementId cannot be null");
        if (movementNumber == null || movementNumber.isBlank()) {
            throw new IllegalArgumentException("Movement number cannot be empty");
        }
        this.movementNumber = movementNumber.trim();
        this.productId = Objects.requireNonNull(productId, "ProductId cannot be null");
        this.warehouseId = Objects.requireNonNull(warehouseId, "WarehouseId cannot be null");
        this.type = Objects.requireNonNull(type, "MovementType cannot be null");
        if (quantity <= 0) {
            throw new IllegalArgumentException("Movement quantity must be positive");
        }
        this.quantity = quantity;
        this.referenceDocument = referenceDocument != null ? referenceDocument.trim() : "";
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    public static StockMovement create(
            String movementNumber,
            ProductId productId,
            WarehouseId warehouseId,
            MovementType type,
            int quantity,
            String referenceDocument
    ) {
        return new StockMovement(
                StockMovementId.generate(),
                movementNumber,
                productId,
                warehouseId,
                type,
                quantity,
                referenceDocument,
                LocalDateTime.now()
        );
    }

    // Getters
    public StockMovementId getId() { return id; }
    public String getMovementNumber() { return movementNumber; }
    public ProductId getProductId() { return productId; }
    public WarehouseId getWarehouseId() { return warehouseId; }
    public MovementType getType() { return type; }
    public int getQuantity() { return quantity; }
    public String getReferenceDocument() { return referenceDocument; }
    public LocalDateTime getTimestamp() { return timestamp; }
}

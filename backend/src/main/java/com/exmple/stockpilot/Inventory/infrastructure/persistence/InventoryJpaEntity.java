package com.exmple.stockpilot.Inventory.infrastructure.persistence;

import com.exmple.stockpilot.Inventory.domain.enums.InventoryStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "inventories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private UUID warehouseId;

    @Column(nullable = false)
    private int quantityOnHand;

    @Column(nullable = false)
    private int reservedQuantity;

    @Column(nullable = false)
    private int reorderPoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryStatus status;
}

package com.exmple.stockpilot.Inventory.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataInventoryRepository extends JpaRepository<InventoryJpaEntity, UUID> {
    Optional<InventoryJpaEntity> findByProductIdAndWarehouseId(UUID productId, UUID warehouseId);
}

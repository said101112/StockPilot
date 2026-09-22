package com.exmple.stockpilot.Inventory.infrastructure.persistence;

import com.exmple.stockpilot.Inventory.application.port.out.InventoryRepository;
import com.exmple.stockpilot.Inventory.domain.model.Inventory;
import com.exmple.stockpilot.Inventory.domain.valueObject.InventoryId;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class InventoryPersistenceAdapter implements InventoryRepository {

    private final SpringDataInventoryRepository springDataInventoryRepository;

    public InventoryPersistenceAdapter(SpringDataInventoryRepository springDataInventoryRepository) {
        this.springDataInventoryRepository = springDataInventoryRepository;
    }

    @Override
    public Inventory save(Inventory inventory) {
        InventoryJpaEntity entity = toEntity(inventory);
        InventoryJpaEntity savedEntity = springDataInventoryRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Inventory> findByProductIdAndWarehouseId(ProductId productId, WarehouseId warehouseId) {
        return springDataInventoryRepository
                .findByProductIdAndWarehouseId(productId.value(), warehouseId.value())
                .map(this::toDomain);
    }

    @Override
    public Optional<Inventory> findById(InventoryId inventoryId) {
        return springDataInventoryRepository.findById(inventoryId.value())
                .map(this::toDomain);
    }

    @Override
    public List<Inventory> findAll() {
        return springDataInventoryRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    private InventoryJpaEntity toEntity(Inventory inventory) {
        return new InventoryJpaEntity(
                inventory.getId().value(),
                inventory.getProductId().value(),
                inventory.getWarehouseId().value(),
                inventory.getQuantityOnHand(),
                inventory.getReservedQuantity(),
                inventory.getReorderPoint(),
                inventory.getStatus()
        );
    }

    private Inventory toDomain(InventoryJpaEntity entity) {
        return new Inventory(
                InventoryId.from(entity.getId()),
                ProductId.from(entity.getProductId()),
                WarehouseId.from(entity.getWarehouseId()),
                entity.getQuantityOnHand(),
                entity.getReservedQuantity(),
                entity.getReorderPoint(),
                entity.getStatus()
        );
    }
}

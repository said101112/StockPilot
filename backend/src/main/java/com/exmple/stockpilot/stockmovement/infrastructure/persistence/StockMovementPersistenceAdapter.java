package com.exmple.stockpilot.stockmovement.infrastructure.persistence;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockmovement.application.port.out.StockMovementRepository;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import com.exmple.stockpilot.stockmovement.domain.model.StockMovement;
import com.exmple.stockpilot.stockmovement.domain.valueobject.StockMovementId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class StockMovementPersistenceAdapter implements StockMovementRepository {

    private final SpringDataStockMovementRepository repository;

    public StockMovementPersistenceAdapter(SpringDataStockMovementRepository repository) {
        this.repository = repository;
    }

    @Override
    public StockMovement save(StockMovement movement) {
        StockMovementJpaEntity entity = toEntity(movement);
        StockMovementJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<StockMovement> findById(StockMovementId id) {
        return repository.findById(id.value()).map(this::toDomain);
    }

    @Override
    public List<StockMovement> findByProductId(ProductId productId) {
        return repository.findByProductIdOrderByTimestampDesc(productId.value()).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<StockMovement> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    private StockMovementJpaEntity toEntity(StockMovement m) {
        return new StockMovementJpaEntity(
                m.getId().value(),
                m.getMovementNumber(),
                m.getProductId().value(),
                m.getWarehouseId().value(),
                m.getType().name(),
                m.getQuantity(),
                m.getReferenceDocument(),
                m.getTimestamp()
        );
    }

    private StockMovement toDomain(StockMovementJpaEntity e) {
        return new StockMovement(
                StockMovementId.from(e.getId()),
                e.getMovementNumber(),
                ProductId.from(e.getProductId()),
                WarehouseId.from(e.getWarehouseId()),
                MovementType.valueOf(e.getType()),
                e.getQuantity(),
                e.getReferenceDocument(),
                e.getTimestamp()
        );
    }
}

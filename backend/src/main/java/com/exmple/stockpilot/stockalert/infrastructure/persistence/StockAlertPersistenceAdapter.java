package com.exmple.stockpilot.stockalert.infrastructure.persistence;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockalert.application.port.out.StockAlertRepository;
import com.exmple.stockpilot.stockalert.domain.enums.AlertSeverity;
import com.exmple.stockpilot.stockalert.domain.enums.AlertStatus;
import com.exmple.stockpilot.stockalert.domain.model.StockAlert;
import com.exmple.stockpilot.stockalert.domain.valueobject.StockAlertId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class StockAlertPersistenceAdapter implements StockAlertRepository {

    private final SpringDataStockAlertRepository springDataStockAlertRepository;

    public StockAlertPersistenceAdapter(SpringDataStockAlertRepository springDataStockAlertRepository) {
        this.springDataStockAlertRepository = springDataStockAlertRepository;
    }

    @Override
    public StockAlert save(StockAlert alert) {
        StockAlertJpaEntity entity = toEntity(alert);
        StockAlertJpaEntity saved = springDataStockAlertRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<StockAlert> findById(StockAlertId id) {
        return springDataStockAlertRepository.findById(id.value())
                .map(this::toDomain);
    }

    @Override
    public Optional<StockAlert> findActiveByProductAndWarehouse(ProductId productId, WarehouseId warehouseId) {
        return springDataStockAlertRepository
                .findByProductIdAndWarehouseIdAndStatus(productId.value(), warehouseId.value(), AlertStatus.ACTIVE.name())
                .map(this::toDomain);
    }

    @Override
    public List<StockAlert> findAllActive() {
        return springDataStockAlertRepository.findByStatus(AlertStatus.ACTIVE.name()).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<StockAlert> findAll() {
        return springDataStockAlertRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    private StockAlertJpaEntity toEntity(StockAlert alert) {
        return new StockAlertJpaEntity(
                alert.getId().value(),
                alert.getProductId().value(),
                alert.getWarehouseId().value(),
                alert.getCurrentStock(),
                alert.getReorderPoint(),
                alert.getSeverity().name(),
                alert.getStatus().name(),
                alert.getCreatedAt(),
                alert.getResolvedAt()
        );
    }

    private StockAlert toDomain(StockAlertJpaEntity entity) {
        return new StockAlert(
                StockAlertId.from(entity.getId()),
                ProductId.from(entity.getProductId()),
                WarehouseId.from(entity.getWarehouseId()),
                entity.getCurrentStock(),
                entity.getReorderPoint(),
                AlertSeverity.valueOf(entity.getSeverity()),
                AlertStatus.valueOf(entity.getStatus()),
                entity.getCreatedAt(),
                entity.getResolvedAt()
        );
    }
}

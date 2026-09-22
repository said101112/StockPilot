package com.exmple.stockpilot.stockalert.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataStockAlertRepository extends JpaRepository<StockAlertJpaEntity, UUID> {

    Optional<StockAlertJpaEntity> findByProductIdAndWarehouseIdAndStatus(UUID productId, UUID warehouseId, String status);

    List<StockAlertJpaEntity> findByStatus(String status);
}

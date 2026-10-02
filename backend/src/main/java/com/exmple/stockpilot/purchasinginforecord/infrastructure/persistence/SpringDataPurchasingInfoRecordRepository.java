package com.exmple.stockpilot.purchasinginforecord.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataPurchasingInfoRecordRepository extends JpaRepository<PurchasingInfoRecordJpaEntity, UUID> {
    List<PurchasingInfoRecordJpaEntity> findByProductId(UUID productId);
    List<PurchasingInfoRecordJpaEntity> findBySupplierId(UUID supplierId);
    Optional<PurchasingInfoRecordJpaEntity> findByProductIdAndSupplierId(UUID productId, UUID supplierId);
}

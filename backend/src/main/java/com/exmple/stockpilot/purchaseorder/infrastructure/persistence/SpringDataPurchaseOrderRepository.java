package com.exmple.stockpilot.purchaseorder.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataPurchaseOrderRepository extends JpaRepository<PurchaseOrderJpaEntity, UUID> {

    Optional<PurchaseOrderJpaEntity> findByPoNumber(String poNumber);

    List<PurchaseOrderJpaEntity> findByStatus(String status);
}

package com.exmple.stockpilot.purchaserequisition.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataPurchaseRequisitionRepository extends JpaRepository<PurchaseRequisitionJpaEntity, UUID> {

    Optional<PurchaseRequisitionJpaEntity> findByPrNumber(String prNumber);

    List<PurchaseRequisitionJpaEntity> findByStatus(String status);
}

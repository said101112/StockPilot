package com.exmple.stockpilot.goodsreceipt.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataGoodsReceiptRepository extends JpaRepository<GoodsReceiptJpaEntity, UUID> {
    Optional<GoodsReceiptJpaEntity> findByGrNumber(String grNumber);
    List<GoodsReceiptJpaEntity> findByPurchaseOrderId(UUID purchaseOrderId);
}

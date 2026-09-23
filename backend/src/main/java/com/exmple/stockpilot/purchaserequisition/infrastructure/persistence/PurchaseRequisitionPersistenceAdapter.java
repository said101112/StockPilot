package com.exmple.stockpilot.purchaserequisition.infrastructure.persistence;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaserequisition.application.port.out.PurchaseRequisitionRepository;
import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
import com.exmple.stockpilot.purchaserequisition.domain.model.PurchaseRequisition;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PurchaseRequisitionPersistenceAdapter implements PurchaseRequisitionRepository {

    private final SpringDataPurchaseRequisitionRepository springDataPurchaseRequisitionRepository;

    public PurchaseRequisitionPersistenceAdapter(SpringDataPurchaseRequisitionRepository springDataPurchaseRequisitionRepository) {
        this.springDataPurchaseRequisitionRepository = springDataPurchaseRequisitionRepository;
    }

    @Override
    public PurchaseRequisition save(PurchaseRequisition pr) {
        PurchaseRequisitionJpaEntity entity = toEntity(pr);
        PurchaseRequisitionJpaEntity saved = springDataPurchaseRequisitionRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<PurchaseRequisition> findById(PurchaseRequisitionId id) {
        return springDataPurchaseRequisitionRepository.findById(id.value())
                .map(this::toDomain);
    }

    @Override
    public Optional<PurchaseRequisition> findByPrNumber(String prNumber) {
        return springDataPurchaseRequisitionRepository.findByPrNumber(prNumber)
                .map(this::toDomain);
    }

    @Override
    public List<PurchaseRequisition> findAll() {
        return springDataPurchaseRequisitionRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<PurchaseRequisition> findByStatus(PurchaseRequisitionStatus status) {
        return springDataPurchaseRequisitionRepository.findByStatus(status.name()).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void deleteById(PurchaseRequisitionId id) {
        springDataPurchaseRequisitionRepository.deleteById(id.value());
    }

    private PurchaseRequisitionJpaEntity toEntity(PurchaseRequisition pr) {
        return new PurchaseRequisitionJpaEntity(
                pr.getId().value(),
                pr.getPrNumber(),
                pr.getProductId().value(),
                pr.getWarehouseId().value(),
                pr.getRequestedQuantity(),
                pr.getRequestedDeliveryDate(),
                pr.getJustification(),
                pr.getStatus().name(),
                pr.getRejectionReason(),
                pr.getCreatedAt(),
                pr.getSubmittedAt()
        );
    }

    private PurchaseRequisition toDomain(PurchaseRequisitionJpaEntity entity) {
        return new PurchaseRequisition(
                PurchaseRequisitionId.from(entity.getId()),
                entity.getPrNumber(),
                ProductId.from(entity.getProductId()),
                WarehouseId.from(entity.getWarehouseId()),
                entity.getRequestedQuantity(),
                entity.getRequestedDeliveryDate(),
                entity.getJustification(),
                PurchaseRequisitionStatus.valueOf(entity.getStatus()),
                entity.getRejectionReason(),
                entity.getCreatedAt(),
                entity.getSubmittedAt()
        );
    }
}

package com.exmple.stockpilot.purchaseorder.infrastructure.persistence;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.application.port.out.PurchaseOrderRepository;
import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrder;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrderItem;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PurchaseOrderPersistenceAdapter implements PurchaseOrderRepository {

    private final SpringDataPurchaseOrderRepository springDataPurchaseOrderRepository;

    public PurchaseOrderPersistenceAdapter(SpringDataPurchaseOrderRepository springDataPurchaseOrderRepository) {
        this.springDataPurchaseOrderRepository = springDataPurchaseOrderRepository;
    }

    @Override
    public PurchaseOrder save(PurchaseOrder po) {
        PurchaseOrderJpaEntity entity = toEntity(po);
        PurchaseOrderJpaEntity saved = springDataPurchaseOrderRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<PurchaseOrder> findById(PurchaseOrderId id) {
        return springDataPurchaseOrderRepository.findById(id.value())
                .map(this::toDomain);
    }

    @Override
    public Optional<PurchaseOrder> findByPoNumber(String poNumber) {
        return springDataPurchaseOrderRepository.findByPoNumber(poNumber)
                .map(this::toDomain);
    }

    @Override
    public List<PurchaseOrder> findAll() {
        return springDataPurchaseOrderRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<PurchaseOrder> findByStatus(PurchaseOrderStatus status) {
        return springDataPurchaseOrderRepository.findByStatus(status.name()).stream()
                .map(this::toDomain)
                .toList();
    }

    private PurchaseOrderJpaEntity toEntity(PurchaseOrder po) {
        List<PurchaseOrderItemJpaEntity> itemEntities = po.getItems().stream()
                .map(item -> new PurchaseOrderItemJpaEntity(
                        item.getId(),
                        po.getId().value(),
                        item.getProductId().value(),
                        item.getProductName(),
                        item.getSku(),
                        item.getOrderedQuantity(),
                        item.getReceivedQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                ))
                .toList();

        return new PurchaseOrderJpaEntity(
                po.getId().value(),
                po.getPoNumber(),
                po.getRequisitionId() != null ? po.getRequisitionId().value() : null,
                po.getSupplierId().value(),
                po.getWarehouseId().value(),
                itemEntities,
                po.getTotalAmount(),
                po.getCurrency(),
                po.getStatus().name(),
                po.getExpectedDeliveryDate(),
                po.getPaymentTerms(),
                po.getCreatedAt(),
                po.getIssuedAt()
        );
    }

    private PurchaseOrder toDomain(PurchaseOrderJpaEntity entity) {
        List<PurchaseOrderItem> items = entity.getItems().stream()
                .map(itemEntity -> new PurchaseOrderItem(
                        itemEntity.getId(),
                        ProductId.from(itemEntity.getProductId()),
                        itemEntity.getProductName(),
                        itemEntity.getSku(),
                        itemEntity.getOrderedQuantity(),
                        itemEntity.getReceivedQuantity(),
                        itemEntity.getUnitPrice()
                ))
                .toList();

        return new PurchaseOrder(
                PurchaseOrderId.from(entity.getId()),
                entity.getPoNumber(),
                entity.getRequisitionId() != null ? PurchaseRequisitionId.from(entity.getRequisitionId()) : null,
                SupplierId.from(entity.getSupplierId()),
                WarehouseId.from(entity.getWarehouseId()),
                items,
                entity.getTotalAmount(),
                entity.getCurrency(),
                PurchaseOrderStatus.valueOf(entity.getStatus()),
                entity.getExpectedDeliveryDate(),
                entity.getPaymentTerms(),
                entity.getCreatedAt(),
                entity.getIssuedAt()
        );
    }
}

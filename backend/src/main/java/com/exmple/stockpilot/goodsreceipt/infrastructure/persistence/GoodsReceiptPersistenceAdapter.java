package com.exmple.stockpilot.goodsreceipt.infrastructure.persistence;

import com.exmple.stockpilot.goodsreceipt.application.port.out.GoodsReceiptRepository;
import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceipt;
import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceiptItem;
import com.exmple.stockpilot.goodsreceipt.domain.valueobject.GoodsReceiptId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class GoodsReceiptPersistenceAdapter implements GoodsReceiptRepository {

    private final SpringDataGoodsReceiptRepository springDataGoodsReceiptRepository;

    public GoodsReceiptPersistenceAdapter(SpringDataGoodsReceiptRepository springDataGoodsReceiptRepository) {
        this.springDataGoodsReceiptRepository = springDataGoodsReceiptRepository;
    }

    @Override
    public GoodsReceipt save(GoodsReceipt goodsReceipt) {
        GoodsReceiptJpaEntity entity = toEntity(goodsReceipt);
        GoodsReceiptJpaEntity saved = springDataGoodsReceiptRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<GoodsReceipt> findById(GoodsReceiptId id) {
        return springDataGoodsReceiptRepository.findById(id.value())
                .map(this::toDomain);
    }

    @Override
    public Optional<GoodsReceipt> findByGrNumber(String grNumber) {
        return springDataGoodsReceiptRepository.findByGrNumber(grNumber)
                .map(this::toDomain);
    }

    @Override
    public List<GoodsReceipt> findAll() {
        return springDataGoodsReceiptRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<GoodsReceipt> findByPurchaseOrderId(PurchaseOrderId purchaseOrderId) {
        return springDataGoodsReceiptRepository.findByPurchaseOrderId(purchaseOrderId.value()).stream()
                .map(this::toDomain)
                .toList();
    }

    private GoodsReceiptJpaEntity toEntity(GoodsReceipt gr) {
        List<GoodsReceiptItemJpaEntity> itemEntities = gr.getItems().stream()
                .map(item -> new GoodsReceiptItemJpaEntity(
                        item.getId(),
                        item.getProductId().value(),
                        item.getProductName(),
                        item.getSku(),
                        item.getReceivedQuantity()
                ))
                .toList();

        return new GoodsReceiptJpaEntity(
                gr.getId().value(),
                gr.getGrNumber(),
                gr.getPurchaseOrderId().value(),
                gr.getDeliveryNoteNumber(),
                gr.getReceivedAt(),
                gr.getNotes(),
                itemEntities
        );
    }

    private GoodsReceipt toDomain(GoodsReceiptJpaEntity entity) {
        List<GoodsReceiptItem> items = entity.getItems().stream()
                .map(item -> new GoodsReceiptItem(
                        item.getId(),
                        ProductId.from(item.getProductId()),
                        item.getProductName(),
                        item.getSku(),
                        item.getReceivedQuantity()
                ))
                .toList();

        return new GoodsReceipt(
                GoodsReceiptId.from(entity.getId()),
                entity.getGrNumber(),
                PurchaseOrderId.from(entity.getPurchaseOrderId()),
                entity.getDeliveryNoteNumber(),
                items,
                entity.getReceivedAt(),
                entity.getNotes()
        );
    }
}

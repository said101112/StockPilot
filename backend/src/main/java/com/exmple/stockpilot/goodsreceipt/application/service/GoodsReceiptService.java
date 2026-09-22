package com.exmple.stockpilot.goodsreceipt.application.service;

import com.exmple.stockpilot.Inventory.application.port.in.CreateInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.in.ManageInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.out.InventoryRepository;
import com.exmple.stockpilot.Inventory.domain.model.Inventory;
import com.exmple.stockpilot.Inventory.presentation.CreateInventoryRequest;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.goodsreceipt.application.port.in.CreateGoodsReceiptUseCase;
import com.exmple.stockpilot.goodsreceipt.application.port.in.GetGoodsReceiptUseCase;
import com.exmple.stockpilot.goodsreceipt.application.port.out.GoodsReceiptRepository;
import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceipt;
import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceiptItem;
import com.exmple.stockpilot.goodsreceipt.domain.valueobject.GoodsReceiptId;
import com.exmple.stockpilot.goodsreceipt.presentation.CreateGoodsReceiptRequest;
import com.exmple.stockpilot.goodsreceipt.presentation.GoodsReceiptItemRequest;
import com.exmple.stockpilot.goodsreceipt.presentation.GoodsReceiptResponse;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.application.port.in.ManagePurchaseOrderUseCase;
import com.exmple.stockpilot.purchaseorder.application.port.out.PurchaseOrderRepository;
import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrder;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrderItem;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;
import com.exmple.stockpilot.stockmovement.application.port.in.RecordStockMovementUseCase;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service d'Orchestration pour la Réception de Marchandises (MIGO / Goods Receipt).
 * Coordonne la mise à jour du Bon de Commande, de l'Inventaire et du Journal des Mouvements.
 */
@Service
public class GoodsReceiptService implements CreateGoodsReceiptUseCase, GetGoodsReceiptUseCase {

    private static final Logger log = LoggerFactory.getLogger(GoodsReceiptService.class);
    private static final AtomicInteger GR_COUNTER = new AtomicInteger((int) (System.currentTimeMillis() % 89999) + 10000);

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ManagePurchaseOrderUseCase managePurchaseOrderUseCase;
    private final InventoryRepository inventoryRepository;
    private final ManageInventoryUseCase manageInventoryUseCase;
    private final CreateInventoryUseCase createInventoryUseCase;
    private final RecordStockMovementUseCase recordStockMovementUseCase;

    public GoodsReceiptService(
            GoodsReceiptRepository goodsReceiptRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            ManagePurchaseOrderUseCase managePurchaseOrderUseCase,
            InventoryRepository inventoryRepository,
            ManageInventoryUseCase manageInventoryUseCase,
            CreateInventoryUseCase createInventoryUseCase,
            RecordStockMovementUseCase recordStockMovementUseCase
    ) {
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.managePurchaseOrderUseCase = managePurchaseOrderUseCase;
        this.inventoryRepository = inventoryRepository;
        this.manageInventoryUseCase = manageInventoryUseCase;
        this.createInventoryUseCase = createInventoryUseCase;
        this.recordStockMovementUseCase = recordStockMovementUseCase;
    }

    @Override
    @Transactional
    public GoodsReceiptResponse createGoodsReceipt(CreateGoodsReceiptRequest request) {
        // 1. Charger et valider le Bon de Commande
        PurchaseOrderId poId = PurchaseOrderId.from(request.purchaseOrderId());
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Purchase Order not found with id: " + request.purchaseOrderId()));

        if (po.getStatus() != PurchaseOrderStatus.ISSUED && po.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new IllegalStateException("Cannot receive goods on Purchase Order with status: " + po.getStatus() 
                    + ". Order must be ISSUED or PARTIALLY_RECEIVED.");
        }

        // 2. Valider chaque article et construire les items du Bon de Réception
        List<GoodsReceiptItem> grItems = new ArrayList<>();
        for (GoodsReceiptItemRequest itemReq : request.items()) {
            PurchaseOrderItem poItem = po.getItems().stream()
                    .filter(i -> i.getProductId().value().equals(itemReq.productId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Product " + itemReq.productId() 
                            + " is not part of Purchase Order " + po.getPoNumber()));

            if (itemReq.receivedQuantity() > poItem.getRemainingQuantity()) {
                throw new IllegalArgumentException(String.format(
                        "Cannot receive %d for SKU %s (%s). Remaining quantity on order is %d.",
                        itemReq.receivedQuantity(), poItem.getSku(), poItem.getProductName(), poItem.getRemainingQuantity()
                ));
            }

            grItems.add(GoodsReceiptItem.create(
                    poItem.getProductId(),
                    poItem.getProductName(),
                    poItem.getSku(),
                    itemReq.receivedQuantity()
            ));
        }

        // 3. Créer et persister le Bon de Réception
        String grNumber = generateGrNumber();
        GoodsReceipt gr = GoodsReceipt.create(
                grNumber,
                po.getId(),
                request.deliveryNoteNumber(),
                grItems,
                request.notes()
        );
        GoodsReceipt savedGr = goodsReceiptRepository.save(gr);
        log.info("Goods Receipt created: {} for PO: {} (BL: {})", 
                savedGr.getGrNumber(), po.getPoNumber(), savedGr.getDeliveryNoteNumber());

        // 4. Mettre à jour la progression de la commande fournisseur (PO)
        for (GoodsReceiptItem item : grItems) {
            managePurchaseOrderUseCase.recordReceiptProgress(
                    po.getId().value(),
                    item.getProductId().value(),
                    item.getReceivedQuantity()
            );
        }

        // 5. Augmenter le stock en magasin et résoudre automatiquement les alertes
        WarehouseId warehouseId = po.getWarehouseId();
        for (GoodsReceiptItem item : grItems) {
            ProductId productId = item.getProductId();
            Optional<Inventory> existingInv = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId);

            if (existingInv.isPresent()) {
                manageInventoryUseCase.increaseStock(existingInv.get().getId().value(), item.getReceivedQuantity());
            } else {
                // Si l'article n'était pas encore en stock dans cet entrepôt, initialisation du casier
                createInventoryUseCase.createInventory(new CreateInventoryRequest(
                        productId.value().toString(),
                        warehouseId.value().toString(),
                        item.getReceivedQuantity(),
                        10 // seuil d'alerte par défaut
                ));
            }

            // 6. Enregistrer le mouvement de stock immuable (Traçabilité SAP 101 Goods Receipt)
            recordStockMovementUseCase.recordMovement(
                    productId.value(),
                    warehouseId.value(),
                    MovementType.GOODS_RECEIPT_PO,
                    item.getReceivedQuantity(),
                    savedGr.getGrNumber() + " (BL: " + savedGr.getDeliveryNoteNumber() + ")"
            );
        }

        return GoodsReceiptResponse.from(savedGr);
    }

    @Override
    public GoodsReceiptResponse getById(UUID id) {
        return goodsReceiptRepository.findById(GoodsReceiptId.from(id))
                .map(GoodsReceiptResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Goods receipt not found with id: " + id));
    }

    @Override
    public GoodsReceiptResponse getByGrNumber(String grNumber) {
        return goodsReceiptRepository.findByGrNumber(grNumber)
                .map(GoodsReceiptResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Goods receipt not found with number: " + grNumber));
    }

    @Override
    public List<GoodsReceiptResponse> getAll() {
        return goodsReceiptRepository.findAll().stream()
                .map(GoodsReceiptResponse::from)
                .toList();
    }

    @Override
    public List<GoodsReceiptResponse> getByPurchaseOrderId(UUID purchaseOrderId) {
        return goodsReceiptRepository.findByPurchaseOrderId(PurchaseOrderId.from(purchaseOrderId)).stream()
                .map(GoodsReceiptResponse::from)
                .toList();
    }

    private synchronized String generateGrNumber() {
        int year = LocalDate.now().getYear();
        return String.format("GR-%d-%04d", year, GR_COUNTER.incrementAndGet());
    }
}

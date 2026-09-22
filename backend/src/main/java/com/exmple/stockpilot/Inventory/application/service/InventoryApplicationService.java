package com.exmple.stockpilot.Inventory.application.service;

import com.exmple.stockpilot.Inventory.application.port.in.CreateInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.in.GetInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.in.ManageInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.out.InventoryRepository;
import com.exmple.stockpilot.Inventory.domain.model.Inventory;
import com.exmple.stockpilot.Inventory.domain.valueObject.InventoryId;
import com.exmple.stockpilot.Inventory.presentation.CreateInventoryRequest;
import com.exmple.stockpilot.Inventory.presentation.InventoryResponse;
import com.exmple.stockpilot.Inventory.presentation.ScrapInventoryResponse;
import com.exmple.stockpilot.Inventory.presentation.ScrapStockRequest;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockalert.application.port.in.ManageStockAlertUseCase;
import com.exmple.stockpilot.stockmovement.application.port.in.RecordStockMovementUseCase;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import com.exmple.stockpilot.stockmovement.presentation.StockMovementResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@Slf4j
public class InventoryApplicationService implements CreateInventoryUseCase, GetInventoryUseCase, ManageInventoryUseCase {

    private final InventoryRepository inventoryRepository;
    private final ManageStockAlertUseCase manageStockAlertUseCase;
    private final RecordStockMovementUseCase recordStockMovementUseCase;

    public InventoryApplicationService(
            InventoryRepository inventoryRepository,
            ManageStockAlertUseCase manageStockAlertUseCase,
            RecordStockMovementUseCase recordStockMovementUseCase
    ) {
        this.inventoryRepository = inventoryRepository;
        this.manageStockAlertUseCase = manageStockAlertUseCase;
        this.recordStockMovementUseCase = recordStockMovementUseCase;
    }

    @Override
    @Transactional
    public InventoryResponse createInventory(CreateInventoryRequest request) {
        ProductId product = ProductId.from(UUID.fromString(request.productId()));
        WarehouseId warehouse = WarehouseId.from(UUID.fromString(request.warehouseId()));

        if (inventoryRepository.findByProductIdAndWarehouseId(product, warehouse).isPresent()) {
            throw new IllegalStateException("Inventory already exists for product " + request.productId() + " in warehouse " + request.warehouseId());
        }

        Inventory inventory = Inventory.create(
                product,
                warehouse,
                request.quantityInitial(),
                request.reorderPoint()
        );

        Inventory savedInventory = inventoryRepository.save(inventory);

        // Détection automatique immédiate dès la création si le stock initial est sous le seuil
        manageStockAlertUseCase.checkAndTriggerAlert(
                savedInventory.getProductId().value(),
                savedInventory.getWarehouseId().value(),
                savedInventory.getAvailableQuantity(),
                savedInventory.getReorderPoint()
        );

        return InventoryResponse.from(savedInventory);
    }

    @Override
    @Transactional
    public InventoryResponse consumeStock(UUID inventoryId, int quantity) {
        Inventory inventory = findInventoryOrThrow(inventoryId);

        // Règle métier dans le modèle de domaine : décrémente et recalcule le statut
        inventory.consumeStock(quantity);
        Inventory saved = inventoryRepository.save(inventory);

        // Notification / Déclenchement automatique de l'alerte si disponible <= seuil
        manageStockAlertUseCase.checkAndTriggerAlert(
                saved.getProductId().value(),
                saved.getWarehouseId().value(),
                saved.getAvailableQuantity(),
                saved.getReorderPoint()
        );

        return InventoryResponse.from(saved);
    }

    @Override
    @Transactional
    public InventoryResponse reserveStock(UUID inventoryId, int quantity) {
        Inventory inventory = findInventoryOrThrow(inventoryId);

        inventory.reserveStock(quantity);
        Inventory saved = inventoryRepository.save(inventory);

        manageStockAlertUseCase.checkAndTriggerAlert(
                saved.getProductId().value(),
                saved.getWarehouseId().value(),
                saved.getAvailableQuantity(),
                saved.getReorderPoint()
        );

        return InventoryResponse.from(saved);
    }

    @Override
    @Transactional
    public InventoryResponse increaseStock(UUID inventoryId, int quantity) {
        Inventory inventory = findInventoryOrThrow(inventoryId);

        inventory.increaseStock(quantity);
        Inventory saved = inventoryRepository.save(inventory);

        // Si le stock est repassé au-dessus du seuil, l'alerte est automatiquement résolue
        if (!saved.isBelowReorderPoint()) {
            manageStockAlertUseCase.resolveAlertIfAny(
                    saved.getProductId().value(),
                    saved.getWarehouseId().value()
            );
        }

        return InventoryResponse.from(saved);
    }

    @Override
    @Transactional
    public ScrapInventoryResponse scrapStock(UUID inventoryId, ScrapStockRequest request) {
        Inventory inventory = findInventoryOrThrow(inventoryId);

        int quantityToScrap = request.quantity();
        inventory.scrapStock(quantityToScrap);
        Inventory saved = inventoryRepository.save(inventory);

        // 1. Enregistrer le mouvement d'audit immuable (SAP MM 551 Scrap / Casse en magasin)
        String refDoc = "SCRAP: " + request.reason() + " (Op: " + request.operator() + ")";
        StockMovementResponse movement = recordStockMovementUseCase.recordMovement(
                saved.getProductId().value(),
                saved.getWarehouseId().value(),
                MovementType.SCRAP_DAMAGED,
                quantityToScrap,
                refDoc
        );

        // 2. Déclencher automatiquement une alerte si le stock disponible restant passe <= seuil
        boolean alertTriggered = false;
        if (saved.isBelowReorderPoint()) {
            manageStockAlertUseCase.checkAndTriggerAlert(
                    saved.getProductId().value(),
                    saved.getWarehouseId().value(),
                    saved.getAvailableQuantity(),
                    saved.getReorderPoint()
            );
            alertTriggered = true;
        }

        log.warn("Scrap declared on inventory {}: -{} PCS (Reason: {}) | Mov: {} | Remaining: {} | Alert: {}",
                inventoryId, quantityToScrap, request.reason(), movement.movementNumber(), saved.getQuantityOnHand(), alertTriggered);

        return ScrapInventoryResponse.from(
                saved,
                quantityToScrap,
                movement.movementNumber(),
                request.reason(),
                request.operator(),
                alertTriggered
        );
    }

    @Override
    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(InventoryResponse::from)
                .toList();
    }

    @Override
    public InventoryResponse getInventoryById(UUID id) {
        return inventoryRepository.findById(InventoryId.from(id))
                .map(InventoryResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Inventory not found with id: " + id));
    }

    @Override
    public InventoryResponse getInventoryByProductAndWarehouse(UUID productId, UUID warehouseId) {
        ProductId pId = ProductId.from(productId);
        WarehouseId wId = WarehouseId.from(warehouseId);
        return inventoryRepository.findByProductIdAndWarehouseId(pId, wId)
                .map(InventoryResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Inventory not found for product " + productId + " and warehouse " + warehouseId));
    }

    private Inventory findInventoryOrThrow(UUID id) {
        return inventoryRepository.findById(InventoryId.from(id))
                .orElseThrow(() -> new NoSuchElementException("Inventory not found with id: " + id));
    }
}

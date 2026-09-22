package com.exmple.stockpilot.Inventory.presentation;

import com.exmple.stockpilot.Inventory.application.port.in.CreateInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.in.GetInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.in.ManageInventoryUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour la gestion de l'Inventaire physique.
 * Rôle utilisateur : Magasinier (Warehouse Clerk)
 */
@RestController
@RequestMapping("/api/inventories")
public class InventoryController {

    private final CreateInventoryUseCase createInventoryUseCase;
    private final GetInventoryUseCase getInventoryUseCase;
    private final ManageInventoryUseCase manageInventoryUseCase;

    public InventoryController(
            CreateInventoryUseCase createInventoryUseCase,
            GetInventoryUseCase getInventoryUseCase,
            ManageInventoryUseCase manageInventoryUseCase
    ) {
        this.createInventoryUseCase = createInventoryUseCase;
        this.getInventoryUseCase = getInventoryUseCase;
        this.manageInventoryUseCase = manageInventoryUseCase;
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(@RequestBody CreateInventoryRequest request) {
        InventoryResponse response = createInventoryUseCase.createInventory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventories() {
        return ResponseEntity.ok(getInventoryUseCase.getAllInventories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(getInventoryUseCase.getInventoryById(id));
    }

    @GetMapping("/product/{productId}/warehouse/{warehouseId}")
    public ResponseEntity<InventoryResponse> getInventoryByProductAndWarehouse(
            @PathVariable UUID productId,
            @PathVariable UUID warehouseId
    ) {
        return ResponseEntity.ok(getInventoryUseCase.getInventoryByProductAndWarehouse(productId, warehouseId));
    }

    @PostMapping("/{id}/consume")
    public ResponseEntity<InventoryResponse> consumeStock(
            @PathVariable UUID id,
            @RequestBody StockOperationRequest request
    ) {
        InventoryResponse response = manageInventoryUseCase.consumeStock(id, request.quantity());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<InventoryResponse> reserveStock(
            @PathVariable UUID id,
            @RequestBody StockOperationRequest request
    ) {
        InventoryResponse response = manageInventoryUseCase.reserveStock(id, request.quantity());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/increase")
    public ResponseEntity<InventoryResponse> increaseStock(
            @PathVariable UUID id,
            @RequestBody StockOperationRequest request
    ) {
        InventoryResponse response = manageInventoryUseCase.increaseStock(id, request.quantity());
        return ResponseEntity.ok(response);
    }

    /**
     * Déclaration d'une pièce cassée / mise au rebut (Équivalent SAP MM 551 - Scrapping).
     * Rôle utilisateur : Magasinier (Warehouse Clerk)
     */
    @PostMapping("/{id}/scrap")
    public ResponseEntity<ScrapInventoryResponse> scrapStock(
            @PathVariable UUID id,
            @RequestBody ScrapStockRequest request
    ) {
        ScrapInventoryResponse response = manageInventoryUseCase.scrapStock(id, request);
        return ResponseEntity.ok(response);
    }
}

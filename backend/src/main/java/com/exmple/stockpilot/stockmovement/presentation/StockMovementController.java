package com.exmple.stockpilot.stockmovement.presentation;

import com.exmple.stockpilot.stockmovement.application.port.in.GetStockMovementUseCase;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour la consultation des Mouvements de Stock (Material Documents / Traçabilité).
 * Rôles utilisateurs : Magasinier (audit physique) et Gestionnaire de stock.
 */
@RestController
@RequestMapping("/api/stock-movements")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
public class StockMovementController {

    private final GetStockMovementUseCase getStockMovementUseCase;

    public StockMovementController(GetStockMovementUseCase getStockMovementUseCase) {
        this.getStockMovementUseCase = getStockMovementUseCase;
    }

    @GetMapping
    public ResponseEntity<List<StockMovementResponse>> getAllMovements() {
        return ResponseEntity.ok(getStockMovementUseCase.getAllMovements());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockMovementResponse>> getMovementsByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(getStockMovementUseCase.getMovementsByProductId(productId));
    }
}

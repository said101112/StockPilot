package com.exmple.stockpilot.stockalert.presentation;

import com.exmple.stockpilot.stockalert.application.port.in.GetStockAlertsUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour la consultation des Alertes de Stock.
 * Rôle utilisateur : Magasinier (Warehouse Clerk) pour préparer ses réapprovisionnements.
 */
@RestController
@RequestMapping("/api/stock-alerts")
public class StockAlertController {

    private final GetStockAlertsUseCase getStockAlertsUseCase;

    public StockAlertController(GetStockAlertsUseCase getStockAlertsUseCase) {
        this.getStockAlertsUseCase = getStockAlertsUseCase;
    }

    @GetMapping
    public ResponseEntity<List<StockAlertResponse>> getAllAlerts() {
        return ResponseEntity.ok(getStockAlertsUseCase.getAllAlerts());
    }

    @GetMapping("/active")
    public ResponseEntity<List<StockAlertResponse>> getActiveAlerts() {
        return ResponseEntity.ok(getStockAlertsUseCase.getActiveAlerts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockAlertResponse> getAlertById(@PathVariable UUID id) {
        return ResponseEntity.ok(getStockAlertsUseCase.getAlertById(id));
    }
}

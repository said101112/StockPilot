package com.exmple.stockpilot.stockalert.application.service;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockalert.application.port.in.GetStockAlertsUseCase;
import com.exmple.stockpilot.stockalert.application.port.in.ManageStockAlertUseCase;
import com.exmple.stockpilot.stockalert.application.port.out.StockAlertRepository;
import com.exmple.stockpilot.stockalert.domain.model.StockAlert;
import com.exmple.stockpilot.stockalert.domain.valueobject.StockAlertId;
import com.exmple.stockpilot.stockalert.presentation.StockAlertResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class StockAlertService implements GetStockAlertsUseCase, ManageStockAlertUseCase {

    private final StockAlertRepository stockAlertRepository;

    public StockAlertService(StockAlertRepository stockAlertRepository) {
        this.stockAlertRepository = stockAlertRepository;
    }

    @Override
    @Transactional
    public void checkAndTriggerAlert(UUID productId, UUID warehouseId, int availableQuantity, int reorderPoint) {
        ProductId pId = ProductId.from(productId);
        WarehouseId wId = WarehouseId.from(warehouseId);

        if (availableQuantity <= reorderPoint) {
            Optional<StockAlert> existingAlert = stockAlertRepository.findActiveByProductAndWarehouse(pId, wId);
            if (existingAlert.isPresent()) {
                // Alerte déjà active : mise à jour du niveau de stock restant
                StockAlert alert = existingAlert.get();
                alert.updateStockLevel(availableQuantity);
                stockAlertRepository.save(alert);
                log.warn("Stock alert UPDATED for product {} in warehouse {}. Remaining: {} / Threshold: {}",
                        productId, warehouseId, availableQuantity, reorderPoint);
            } else {
                // Nouvelle alerte levée automatiquement
                StockAlert newAlert = StockAlert.create(pId, wId, availableQuantity, reorderPoint);
                stockAlertRepository.save(newAlert);
                log.warn("NEW Stock alert TRIGGERED for product {} in warehouse {}. Current: {} <= ReorderPoint: {}",
                        productId, warehouseId, availableQuantity, reorderPoint);
            }
        } else {
            // Le stock est au-dessus du seuil : s'il y avait une alerte active, on la résout
            resolveAlertIfAny(productId, warehouseId);
        }
    }

    @Override
    @Transactional
    public void resolveAlertIfAny(UUID productId, UUID warehouseId) {
        ProductId pId = ProductId.from(productId);
        WarehouseId wId = WarehouseId.from(warehouseId);

        stockAlertRepository.findActiveByProductAndWarehouse(pId, wId).ifPresent(alert -> {
            alert.resolve();
            stockAlertRepository.save(alert);
            log.info("Stock alert RESOLVED for product {} in warehouse {}", productId, warehouseId);
        });
    }

    @Override
    public List<StockAlertResponse> getActiveAlerts() {
        return stockAlertRepository.findAllActive().stream()
                .map(StockAlertResponse::from)
                .toList();
    }

    @Override
    public List<StockAlertResponse> getAllAlerts() {
        return stockAlertRepository.findAll().stream()
                .map(StockAlertResponse::from)
                .toList();
    }

    @Override
    public StockAlertResponse getAlertById(UUID id) {
        return stockAlertRepository.findById(StockAlertId.from(id))
                .map(StockAlertResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Stock alert not found with id: " + id));
    }
}

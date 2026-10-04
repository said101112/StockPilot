package com.exmple.stockpilot.stockalert.application.service;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockalert.application.port.out.StockAlertRepository;
import com.exmple.stockpilot.stockalert.domain.enums.AlertSeverity;
import com.exmple.stockpilot.stockalert.domain.enums.AlertStatus;
import com.exmple.stockpilot.stockalert.domain.model.StockAlert;
import com.exmple.stockpilot.stockalert.presentation.StockAlertResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StockAlertService Unit Tests")
class StockAlertServiceTest {

    @Mock
    private StockAlertRepository repository;

    private StockAlertService service;

    @BeforeEach
    void setUp() {
        service = new StockAlertService(repository);
    }

    @Test
    @DisplayName("Should trigger new alert when stock is below reorder point and no existing alert")
    void shouldTriggerNewAlert() {
        UUID prodId = UUID.randomUUID();
        UUID whId = UUID.randomUUID();

        when(repository.findActiveByProductAndWarehouse(ProductId.from(prodId), WarehouseId.from(whId)))
                .thenReturn(Optional.empty());

        service.checkAndTriggerAlert(prodId, whId, 5, 20);

        verify(repository, times(1)).save(any(StockAlert.class));
    }

    @Test
    @DisplayName("Should update existing alert level when alert already exists")
    void shouldUpdateExistingAlert() {
        UUID prodId = UUID.randomUUID();
        UUID whId = UUID.randomUUID();
        StockAlert existingAlert = StockAlert.create(ProductId.from(prodId), WarehouseId.from(whId), 10, 20);

        when(repository.findActiveByProductAndWarehouse(ProductId.from(prodId), WarehouseId.from(whId)))
                .thenReturn(Optional.of(existingAlert));

        service.checkAndTriggerAlert(prodId, whId, 2, 20);

        assertEquals(2, existingAlert.getCurrentStock());
        assertEquals(AlertSeverity.HIGH, existingAlert.getSeverity());
        verify(repository, times(1)).save(existingAlert);
    }

    @Test
    @DisplayName("Should resolve active alert when stock is replenished above threshold")
    void shouldResolveAlertWhenStockAboveThreshold() {
        UUID prodId = UUID.randomUUID();
        UUID whId = UUID.randomUUID();
        StockAlert existingAlert = StockAlert.create(ProductId.from(prodId), WarehouseId.from(whId), 5, 20);

        when(repository.findActiveByProductAndWarehouse(ProductId.from(prodId), WarehouseId.from(whId)))
                .thenReturn(Optional.of(existingAlert));

        service.checkAndTriggerAlert(prodId, whId, 25, 20);

        assertEquals(AlertStatus.RESOLVED, existingAlert.getStatus());
        verify(repository, times(1)).save(existingAlert);
    }

    @Test
    @DisplayName("Should list active alerts")
    void shouldListActiveAlerts() {
        StockAlert alert = StockAlert.create(ProductId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), 2, 10);
        when(repository.findAllActive()).thenReturn(List.of(alert));

        List<StockAlertResponse> list = service.getActiveAlerts();

        assertEquals(1, list.size());
        verify(repository, times(1)).findAllActive();
    }
}

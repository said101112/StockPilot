package com.exmple.stockpilot.Inventory.application.service;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryApplicationService Unit Tests")
class InventoryApplicationServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ManageStockAlertUseCase manageStockAlertUseCase;

    @Mock
    private RecordStockMovementUseCase recordStockMovementUseCase;

    private InventoryApplicationService service;

    @BeforeEach
    void setUp() {
        service = new InventoryApplicationService(
                inventoryRepository,
                manageStockAlertUseCase,
                recordStockMovementUseCase
        );
    }

    @Test
    @DisplayName("Should create inventory and trigger alert check")
    void shouldCreateInventorySuccessfully() {
        UUID prodId = UUID.randomUUID();
        UUID whId = UUID.randomUUID();

        when(inventoryRepository.findByProductIdAndWarehouseId(any(), any())).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateInventoryRequest request = new CreateInventoryRequest(
                prodId.toString(),
                whId.toString(),
                100,
                20
        );

        InventoryResponse response = service.createInventory(request);

        assertNotNull(response);
        assertEquals(100, response.quantityOnHand());
        assertEquals(20, response.reorderPoint());

        verify(inventoryRepository, times(1)).save(any(Inventory.class));
        verify(manageStockAlertUseCase, times(1)).checkAndTriggerAlert(eq(prodId), eq(whId), eq(100), eq(20));
    }

    @Test
    @DisplayName("Should reject duplicate inventory creation for same product and warehouse")
    void shouldRejectDuplicateInventory() {
        UUID prodId = UUID.randomUUID();
        UUID whId = UUID.randomUUID();

        Inventory existing = Inventory.create(ProductId.from(prodId), WarehouseId.from(whId), 50, 10);
        when(inventoryRepository.findByProductIdAndWarehouseId(any(), any())).thenReturn(Optional.of(existing));

        CreateInventoryRequest request = new CreateInventoryRequest(prodId.toString(), whId.toString(), 10, 5);

        assertThrows(IllegalStateException.class, () -> service.createInventory(request));
    }

    @Test
    @DisplayName("Should consume stock and trigger alert check")
    void shouldConsumeStock() {
        UUID invId = UUID.randomUUID();
        Inventory inventory = Inventory.create(ProductId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), 50, 15);

        when(inventoryRepository.findById(InventoryId.from(invId))).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        InventoryResponse response = service.consumeStock(invId, 20);

        assertEquals(30, response.quantityOnHand());
        verify(manageStockAlertUseCase, times(1)).checkAndTriggerAlert(any(), any(), eq(30), eq(15));
    }

    @Test
    @DisplayName("Should reserve stock successfully")
    void shouldReserveStock() {
        UUID invId = UUID.randomUUID();
        Inventory inventory = Inventory.create(ProductId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), 50, 15);

        when(inventoryRepository.findById(InventoryId.from(invId))).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        InventoryResponse response = service.reserveStock(invId, 10);

        assertEquals(50, response.quantityOnHand());
        assertEquals(10, response.reservedQuantity());
        assertEquals(40, response.availableQuantity());
    }

    @Test
    @DisplayName("Should increase stock and resolve alert if replenished")
    void shouldIncreaseStockAndResolveAlert() {
        UUID invId = UUID.randomUUID();
        Inventory inventory = Inventory.create(ProductId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), 10, 20);

        when(inventoryRepository.findById(InventoryId.from(invId))).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        // Increases by 30 -> total 40 (> reorderPoint 20)
        InventoryResponse response = service.increaseStock(invId, 30);

        assertEquals(40, response.quantityOnHand());
        verify(manageStockAlertUseCase, times(1)).resolveAlertIfAny(any(), any());
    }

    @Test
    @DisplayName("Should scrap stock, record movement and return ScrapInventoryResponse")
    void shouldScrapStock() {
        UUID invId = UUID.randomUUID();
        Inventory inventory = Inventory.create(ProductId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), 50, 10);

        when(inventoryRepository.findById(InventoryId.from(invId))).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        StockMovementResponse movResponse = new StockMovementResponse(
                UUID.randomUUID(),
                "MOV-2026-001",
                inventory.getProductId().value(),
                inventory.getWarehouseId().value(),
                "SCRAP_DAMAGED",
                5,
                "SCRAP: Broken pallet",
                LocalDateTime.now()
        );
        when(recordStockMovementUseCase.recordMovement(any(), any(), eq(MovementType.SCRAP_DAMAGED), eq(5), anyString()))
                .thenReturn(movResponse);

        ScrapStockRequest scrapRequest = new ScrapStockRequest(5, "Broken pallet", "John Doe");
        ScrapInventoryResponse result = service.scrapStock(invId, scrapRequest);

        assertNotNull(result);
        assertEquals(45, result.remainingStock());
        assertEquals(5, result.quantityScrapped());
        assertEquals("MOV-2026-001", result.movementNumber());
        assertEquals("Broken pallet", result.scrapReason());
        assertEquals("John Doe", result.operator());
    }

    @Test
    @DisplayName("Should return all inventories")
    void shouldReturnAllInventories() {
        Inventory inv1 = Inventory.create(ProductId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), 10, 5);
        when(inventoryRepository.findAll()).thenReturn(List.of(inv1));

        List<InventoryResponse> list = service.getAllInventories();
        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when inventory not found by ID")
    void shouldThrowWhenInventoryNotFound() {
        UUID id = UUID.randomUUID();
        when(inventoryRepository.findById(InventoryId.from(id))).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getInventoryById(id));
    }
}

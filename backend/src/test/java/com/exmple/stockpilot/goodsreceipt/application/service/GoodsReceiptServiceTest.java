package com.exmple.stockpilot.goodsreceipt.application.service;

import com.exmple.stockpilot.Inventory.application.port.in.CreateInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.in.ManageInventoryUseCase;
import com.exmple.stockpilot.Inventory.application.port.out.InventoryRepository;
import com.exmple.stockpilot.Inventory.domain.model.Inventory;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.goodsreceipt.application.port.out.GoodsReceiptRepository;
import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceipt;
import com.exmple.stockpilot.goodsreceipt.domain.valueobject.GoodsReceiptId;
import com.exmple.stockpilot.goodsreceipt.presentation.CreateGoodsReceiptRequest;
import com.exmple.stockpilot.goodsreceipt.presentation.GoodsReceiptItemRequest;
import com.exmple.stockpilot.goodsreceipt.presentation.GoodsReceiptResponse;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.application.port.in.ManagePurchaseOrderUseCase;
import com.exmple.stockpilot.purchaseorder.application.port.out.PurchaseOrderRepository;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrder;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrderItem;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import com.exmple.stockpilot.stockmovement.application.port.in.RecordStockMovementUseCase;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GoodsReceiptService Unit Tests")
class GoodsReceiptServiceTest {

    @Mock
    private GoodsReceiptRepository goodsReceiptRepository;

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private ManagePurchaseOrderUseCase managePurchaseOrderUseCase;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ManageInventoryUseCase manageInventoryUseCase;

    @Mock
    private CreateInventoryUseCase createInventoryUseCase;

    @Mock
    private RecordStockMovementUseCase recordStockMovementUseCase;

    private GoodsReceiptService service;

    @BeforeEach
    void setUp() {
        service = new GoodsReceiptService(
                goodsReceiptRepository,
                purchaseOrderRepository,
                managePurchaseOrderUseCase,
                inventoryRepository,
                manageInventoryUseCase,
                createInventoryUseCase,
                recordStockMovementUseCase
        );
    }

    @Test
    @DisplayName("Should create goods receipt, update PO, inventory and audit movements")
    void shouldCreateGoodsReceiptSuccessfully() {
        UUID poId = UUID.randomUUID();
        ProductId prodId = ProductId.from(UUID.randomUUID());
        WarehouseId whId = WarehouseId.from(UUID.randomUUID());

        PurchaseOrderItem item = PurchaseOrderItem.create(prodId, "Shaft", "SKU-SFT", 50, new BigDecimal("25.00"));
        PurchaseOrder po = PurchaseOrder.create("PO-2026-0010", PurchaseRequisitionId.from(UUID.randomUUID()), SupplierId.from(UUID.randomUUID()), whId, List.of(item), "EUR", LocalDate.now(), "NET30");
        po.issue();

        when(purchaseOrderRepository.findById(PurchaseOrderId.from(poId))).thenReturn(Optional.of(po));
        when(goodsReceiptRepository.save(any(GoodsReceipt.class))).thenAnswer(inv -> inv.getArgument(0));

        Inventory inventory = Inventory.create(prodId, whId, 10, 5);
        when(inventoryRepository.findByProductIdAndWarehouseId(prodId, whId)).thenReturn(Optional.of(inventory));

        CreateGoodsReceiptRequest request = new CreateGoodsReceiptRequest(
                poId,
                "BL-2026-999",
                List.of(new GoodsReceiptItemRequest(prodId.value(), 30)),
                "Livraison sans casse"
        );

        GoodsReceiptResponse response = service.createGoodsReceipt(request);

        assertNotNull(response);
        assertEquals("BL-2026-999", response.deliveryNoteNumber());
        assertEquals(1, response.items().size());
        assertEquals(30, response.items().get(0).receivedQuantity());

        verify(goodsReceiptRepository, times(1)).save(any(GoodsReceipt.class));
        verify(managePurchaseOrderUseCase, times(1)).recordReceiptProgress(po.getId().value(), prodId.value(), 30);
        verify(manageInventoryUseCase, times(1)).increaseStock(inventory.getId().value(), 30);
        verify(recordStockMovementUseCase, times(1)).recordMovement(eq(prodId.value()), eq(whId.value()), eq(MovementType.GOODS_RECEIPT_PO), eq(30), anyString());
    }

    @Test
    @DisplayName("Should reject goods receipt if PO is not in ISSUED or PARTIALLY_RECEIVED status")
    void shouldRejectWhenPoNotInValidStatus() {
        UUID poId = UUID.randomUUID();
        PurchaseOrderItem item = PurchaseOrderItem.create(ProductId.from(UUID.randomUUID()), "Shaft", "SKU-SFT", 50, new BigDecimal("25.00"));
        PurchaseOrder po = PurchaseOrder.create("PO-2026-0011", PurchaseRequisitionId.from(UUID.randomUUID()), SupplierId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), List.of(item), "EUR", LocalDate.now(), "NET30");
        // Status is still DRAFT

        when(purchaseOrderRepository.findById(PurchaseOrderId.from(poId))).thenReturn(Optional.of(po));

        CreateGoodsReceiptRequest request = new CreateGoodsReceiptRequest(
                poId,
                "BL-1",
                List.of(new GoodsReceiptItemRequest(item.getProductId().value(), 10)),
                ""
        );

        assertThrows(IllegalStateException.class, () -> service.createGoodsReceipt(request));
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when goods receipt not found by ID")
    void shouldThrowWhenGrNotFound() {
        UUID id = UUID.randomUUID();
        when(goodsReceiptRepository.findById(GoodsReceiptId.from(id))).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getById(id));
    }
}

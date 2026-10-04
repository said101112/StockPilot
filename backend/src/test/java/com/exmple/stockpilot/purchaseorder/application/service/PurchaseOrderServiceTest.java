package com.exmple.stockpilot.purchaseorder.application.service;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.application.port.out.ProductRepository;
import com.exmple.stockpilot.product.domain.model.Product;
import com.exmple.stockpilot.product.domain.valueobject.Price;
import com.exmple.stockpilot.product.domain.valueobject.ProductCategory;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.product.domain.valueobject.SKU;
import com.exmple.stockpilot.product.domain.valueobject.UnitOfMeasure;
import com.exmple.stockpilot.purchaseorder.application.port.out.PurchaseOrderRepository;
import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrder;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrderItem;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;
import com.exmple.stockpilot.purchaseorder.presentation.CreatePurchaseOrderFromRequisitionRequest;
import com.exmple.stockpilot.purchaseorder.presentation.PurchaseOrderResponse;
import com.exmple.stockpilot.purchaserequisition.application.port.out.PurchaseRequisitionRepository;
import com.exmple.stockpilot.purchaserequisition.domain.model.PurchaseRequisition;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import com.exmple.stockpilot.supplier.application.port.out.SupplierRepository;
import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
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
@DisplayName("PurchaseOrderService Unit Tests")
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private PurchaseRequisitionRepository purchaseRequisitionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    private PurchaseOrderService service;

    @BeforeEach
    void setUp() {
        service = new PurchaseOrderService(
                purchaseOrderRepository,
                purchaseRequisitionRepository,
                productRepository,
                supplierRepository
        );
    }

    @Test
    @DisplayName("Should create purchase order from approved requisition")
    void shouldCreatePurchaseOrderFromRequisition() {
        UUID reqId = UUID.randomUUID();
        UUID supId = UUID.randomUUID();
        UUID prodId = UUID.randomUUID();
        UUID whId = UUID.randomUUID();

        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-0001",
                ProductId.from(prodId),
                WarehouseId.from(whId),
                50,
                LocalDate.now().plusDays(10),
                "Restock"
        );
        pr.submit();
        pr.approve();

        Product product = Product.create("Filter", "Oil filter", SKU.of("SKU-FLT"), Price.of(new BigDecimal("15.00"), "EUR"), UnitOfMeasure.of("PCS"), ProductCategory.SPARE_PART);
        Supplier supplier = Supplier.create("AutoParts Ltd", ContactInfo.of("sales@autoparts.com", "+33123456789"), "Paris", "FR999", "NET30", "EUR");

        when(purchaseRequisitionRepository.findById(PurchaseRequisitionId.from(reqId))).thenReturn(Optional.of(pr));
        when(productRepository.findById(pr.getProductId())).thenReturn(Optional.of(product));
        when(supplierRepository.findById(SupplierId.from(supId))).thenReturn(Optional.of(supplier));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        CreatePurchaseOrderFromRequisitionRequest request = new CreatePurchaseOrderFromRequisitionRequest(
                reqId.toString(),
                supId.toString(),
                new BigDecimal("14.00"), // negotiated price
                LocalDate.now().plusDays(8)
        );

        PurchaseOrderResponse response = service.createFromRequisition(request);

        assertNotNull(response);
        assertEquals("DRAFT", response.status());
        assertEquals("EUR", response.currency());
        assertEquals(new BigDecimal("700.00"), response.totalAmount()); // 50 * 14.00
        verify(purchaseRequisitionRepository, times(1)).save(pr);
        verify(purchaseOrderRepository, times(1)).save(any(PurchaseOrder.class));
    }

    @Test
    @DisplayName("Should issue purchase order")
    void shouldIssueOrder() {
        UUID id = UUID.randomUUID();
        PurchaseOrderItem item = PurchaseOrderItem.create(ProductId.from(UUID.randomUUID()), "Item", "SKU-1", 10, new BigDecimal("20.00"));
        PurchaseOrder po = PurchaseOrder.create("PO-2026-001", PurchaseRequisitionId.from(UUID.randomUUID()), SupplierId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), List.of(item), "EUR", LocalDate.now(), "NET30");

        when(purchaseOrderRepository.findById(PurchaseOrderId.from(id))).thenReturn(Optional.of(po));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        PurchaseOrderResponse response = service.issueOrder(id);

        assertEquals("ISSUED", response.status());
        verify(purchaseOrderRepository, times(1)).save(po);
    }

    @Test
    @DisplayName("Should cancel purchase order")
    void shouldCancelOrder() {
        UUID id = UUID.randomUUID();
        PurchaseOrderItem item = PurchaseOrderItem.create(ProductId.from(UUID.randomUUID()), "Item", "SKU-1", 10, new BigDecimal("20.00"));
        PurchaseOrder po = PurchaseOrder.create("PO-2026-002", PurchaseRequisitionId.from(UUID.randomUUID()), SupplierId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), List.of(item), "EUR", LocalDate.now(), "NET30");

        when(purchaseOrderRepository.findById(PurchaseOrderId.from(id))).thenReturn(Optional.of(po));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        PurchaseOrderResponse response = service.cancelOrder(id);

        assertEquals("CANCELLED", response.status());
    }

    @Test
    @DisplayName("Should record receipt progress on purchase order")
    void shouldRecordReceiptProgress() {
        UUID poId = UUID.randomUUID();
        ProductId prodId = ProductId.from(UUID.randomUUID());
        PurchaseOrderItem item = PurchaseOrderItem.create(prodId, "Item", "SKU-1", 10, new BigDecimal("20.00"));
        PurchaseOrder po = PurchaseOrder.create("PO-2026-003", PurchaseRequisitionId.from(UUID.randomUUID()), SupplierId.from(UUID.randomUUID()), WarehouseId.from(UUID.randomUUID()), List.of(item), "EUR", LocalDate.now(), "NET30");
        po.issue();

        when(purchaseOrderRepository.findById(PurchaseOrderId.from(poId))).thenReturn(Optional.of(po));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        PurchaseOrderResponse response = service.recordReceiptProgress(poId, prodId.value(), 5);

        assertEquals("PARTIALLY_RECEIVED", response.status());
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when PO not found")
    void shouldThrowWhenPoNotFound() {
        UUID id = UUID.randomUUID();
        when(purchaseOrderRepository.findById(PurchaseOrderId.from(id))).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getOrderById(id));
    }
}

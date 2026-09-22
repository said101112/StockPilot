package com.exmple.stockpilot.purchaseorder.application.service;

import com.exmple.stockpilot.product.application.port.out.ProductRepository;
import com.exmple.stockpilot.product.domain.model.Product;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaseorder.application.port.in.CreatePurchaseOrderUseCase;
import com.exmple.stockpilot.purchaseorder.application.port.in.GetPurchaseOrderUseCase;
import com.exmple.stockpilot.purchaseorder.application.port.in.ManagePurchaseOrderUseCase;
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
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class PurchaseOrderService implements
        CreatePurchaseOrderUseCase,
        ManagePurchaseOrderUseCase,
        GetPurchaseOrderUseCase {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseRequisitionRepository purchaseRequisitionRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    private static final AtomicInteger PO_COUNTER = new AtomicInteger((int) (System.currentTimeMillis() % 89999) + 10000);

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseRequisitionRepository purchaseRequisitionRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository
    ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseRequisitionRepository = purchaseRequisitionRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    @Transactional
    public PurchaseOrderResponse createFromRequisition(CreatePurchaseOrderFromRequisitionRequest request) {
        // 1. Récupérer et valider la Demande d'Achat (DA)
        PurchaseRequisitionId prId = PurchaseRequisitionId.from(UUID.fromString(request.requisitionId()));
        PurchaseRequisition pr = purchaseRequisitionRepository.findById(prId)
                .orElseThrow(() -> new NoSuchElementException("Purchase requisition not found: " + request.requisitionId()));

        // 2. Récupérer l'Article (pour obtenir nom et SKU officiels)
        Product product = productRepository.findById(pr.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found: " + pr.getProductId().value()));

        // 3. Récupérer le Fournisseur (pour obtenir conditions de paiement et devise)
        SupplierId supplierId = SupplierId.from(UUID.fromString(request.supplierId()));
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new NoSuchElementException("Supplier not found: " + request.supplierId()));

        // 4. Déterminer le prix unitaire convenu (prix négocié ou prix de référence)
        BigDecimal unitPrice = (request.negotiatedUnitPrice() != null && request.negotiatedUnitPrice().compareTo(BigDecimal.ZERO) > 0)
                ? request.negotiatedUnitPrice()
                : product.getPrice().amount();

        // 5. Créer la ligne de commande (PurchaseOrderItem)
        PurchaseOrderItem item = PurchaseOrderItem.create(
                product.getId(),
                product.getName(),
                product.getSku().value(),
                pr.getRequestedQuantity(),
                unitPrice
        );

        // 6. Créer le Bon de Commande (PurchaseOrder)
        String poNumber = generatePoNumber();
        PurchaseOrder po = PurchaseOrder.create(
                poNumber,
                pr.getId(),
                supplier.getId(),
                pr.getWarehouseId(),
                List.of(item),
                supplier.getCurrency(),
                request.expectedDeliveryDate() != null ? request.expectedDeliveryDate() : pr.getRequestedDeliveryDate(),
                supplier.getPaymentTerms()
        );

        // 7. Mettre à jour la DA : elle passe automatiquement à l'état ORDERED
        pr.markAsOrdered();
        purchaseRequisitionRepository.save(pr);

        PurchaseOrder savedPo = purchaseOrderRepository.save(po);
        log.info("Purchase Order created: {} for DA: {} - Total: {} {}", 
                savedPo.getPoNumber(), pr.getPrNumber(), savedPo.getTotalAmount(), savedPo.getCurrency());

        return PurchaseOrderResponse.from(savedPo);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse issueOrder(UUID id) {
        PurchaseOrder po = findOrThrow(id);

        po.issue();
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        log.info("Purchase Order officially ISSUED to supplier: {}", saved.getPoNumber());

        return PurchaseOrderResponse.from(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse cancelOrder(UUID id) {
        PurchaseOrder po = findOrThrow(id);

        po.cancel();
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        log.info("Purchase Order CANCELLED: {}", saved.getPoNumber());

        return PurchaseOrderResponse.from(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse recordReceiptProgress(UUID poId, UUID productId, int receivedQuantity) {
        PurchaseOrder po = findOrThrow(poId);

        po.recordReceipt(ProductId.from(productId), receivedQuantity);
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        log.info("Purchase Order {} receipt updated: status now {}", saved.getPoNumber(), saved.getStatus());

        return PurchaseOrderResponse.from(saved);
    }

    @Override
    public List<PurchaseOrderResponse> getAllOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(PurchaseOrderResponse::from)
                .toList();
    }

    @Override
    public List<PurchaseOrderResponse> getOrdersByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.findByStatus(status).stream()
                .map(PurchaseOrderResponse::from)
                .toList();
    }

    @Override
    public PurchaseOrderResponse getOrderById(UUID id) {
        return purchaseOrderRepository.findById(PurchaseOrderId.from(id))
                .map(PurchaseOrderResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Purchase order not found with id: " + id));
    }

    @Override
    public PurchaseOrderResponse getOrderByPoNumber(String poNumber) {
        return purchaseOrderRepository.findByPoNumber(poNumber)
                .map(PurchaseOrderResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Purchase order not found with number: " + poNumber));
    }

    private PurchaseOrder findOrThrow(UUID id) {
        return purchaseOrderRepository.findById(PurchaseOrderId.from(id))
                .orElseThrow(() -> new NoSuchElementException("Purchase order not found with id: " + id));
    }

    private synchronized String generatePoNumber() {
        int year = LocalDate.now().getYear();
        return String.format("PO-%d-%04d", year, PO_COUNTER.incrementAndGet());
    }
}

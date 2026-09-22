package com.exmple.stockpilot.purchaserequisition.application.service;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaserequisition.application.port.in.CreatePurchaseRequisitionUseCase;
import com.exmple.stockpilot.purchaserequisition.application.port.in.GetPurchaseRequisitionUseCase;
import com.exmple.stockpilot.purchaserequisition.application.port.in.ManagePurchaseRequisitionUseCase;
import com.exmple.stockpilot.purchaserequisition.application.port.out.PurchaseRequisitionRepository;
import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
import com.exmple.stockpilot.purchaserequisition.domain.model.PurchaseRequisition;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import com.exmple.stockpilot.purchaserequisition.presentation.CreatePurchaseRequisitionRequest;
import com.exmple.stockpilot.purchaserequisition.presentation.PurchaseRequisitionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class PurchaseRequisitionService implements
        CreatePurchaseRequisitionUseCase,
        ManagePurchaseRequisitionUseCase,
        GetPurchaseRequisitionUseCase {

    private final PurchaseRequisitionRepository purchaseRequisitionRepository;
    private static final AtomicInteger PR_COUNTER = new AtomicInteger((int) (System.currentTimeMillis() % 89999) + 10000);

    public PurchaseRequisitionService(PurchaseRequisitionRepository purchaseRequisitionRepository) {
        this.purchaseRequisitionRepository = purchaseRequisitionRepository;
    }

    @Override
    @Transactional
    public PurchaseRequisitionResponse createRequisition(CreatePurchaseRequisitionRequest request) {
        ProductId productId = ProductId.from(UUID.fromString(request.productId()));
        WarehouseId warehouseId = WarehouseId.from(UUID.fromString(request.warehouseId()));

        String prNumber = generatePrNumber();

        PurchaseRequisition pr = PurchaseRequisition.create(
                prNumber,
                productId,
                warehouseId,
                request.requestedQuantity(),
                request.requestedDeliveryDate(),
                request.justification()
        );

        PurchaseRequisition saved = purchaseRequisitionRepository.save(pr);
        log.info("Purchase requisition created: {} for product {}", saved.getPrNumber(), request.productId());

        return PurchaseRequisitionResponse.from(saved);
    }

    @Override
    @Transactional
    public PurchaseRequisitionResponse submitRequisition(UUID id) {
        PurchaseRequisition pr = findOrThrow(id);

        // Transition d'état métier dans le modèle de domaine
        pr.submit();
        PurchaseRequisition saved = purchaseRequisitionRepository.save(pr);
        log.info("Purchase requisition submitted: {}", saved.getPrNumber());

        return PurchaseRequisitionResponse.from(saved);
    }

    @Override
    @Transactional
    public PurchaseRequisitionResponse approveRequisition(UUID id) {
        PurchaseRequisition pr = findOrThrow(id);

        pr.approve();
        PurchaseRequisition saved = purchaseRequisitionRepository.save(pr);
        log.info("Purchase requisition approved: {}", saved.getPrNumber());

        return PurchaseRequisitionResponse.from(saved);
    }

    @Override
    @Transactional
    public PurchaseRequisitionResponse rejectRequisition(UUID id, String reason) {
        PurchaseRequisition pr = findOrThrow(id);

        pr.reject(reason);
        PurchaseRequisition saved = purchaseRequisitionRepository.save(pr);
        log.info("Purchase requisition rejected: {} (reason: {})", saved.getPrNumber(), reason);

        return PurchaseRequisitionResponse.from(saved);
    }

    @Override
    public List<PurchaseRequisitionResponse> getAllRequisitions() {
        return purchaseRequisitionRepository.findAll().stream()
                .map(PurchaseRequisitionResponse::from)
                .toList();
    }

    @Override
    public List<PurchaseRequisitionResponse> getRequisitionsByStatus(PurchaseRequisitionStatus status) {
        return purchaseRequisitionRepository.findByStatus(status).stream()
                .map(PurchaseRequisitionResponse::from)
                .toList();
    }

    @Override
    public PurchaseRequisitionResponse getRequisitionById(UUID id) {
        return purchaseRequisitionRepository.findById(PurchaseRequisitionId.from(id))
                .map(PurchaseRequisitionResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Purchase requisition not found with id: " + id));
    }

    private PurchaseRequisition findOrThrow(UUID id) {
        return purchaseRequisitionRepository.findById(PurchaseRequisitionId.from(id))
                .orElseThrow(() -> new NoSuchElementException("Purchase requisition not found with id: " + id));
    }

    private synchronized String generatePrNumber() {
        int year = LocalDate.now().getYear();
        return String.format("PR-%d-%04d", year, PR_COUNTER.incrementAndGet());
    }
}

package com.exmple.stockpilot.purchaseorder.presentation;

import com.exmple.stockpilot.purchaseorder.application.port.in.CreatePurchaseOrderUseCase;
import com.exmple.stockpilot.purchaseorder.application.port.in.GetPurchaseOrderUseCase;
import com.exmple.stockpilot.purchaseorder.application.port.in.ManagePurchaseOrderUseCase;
import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
 * Contrôleur REST pour la gestion des Bons de Commande Fournisseurs (PO / Purchase Order).
 * Rôle utilisateur : Acheteur (Purchasing Buyer).
 */
@RestController
@RequestMapping("/api/purchase-orders")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
public class PurchaseOrderController {

    private final CreatePurchaseOrderUseCase createPurchaseOrderUseCase;
    private final ManagePurchaseOrderUseCase managePurchaseOrderUseCase;
    private final GetPurchaseOrderUseCase getPurchaseOrderUseCase;

    public PurchaseOrderController(
            CreatePurchaseOrderUseCase createPurchaseOrderUseCase,
            ManagePurchaseOrderUseCase managePurchaseOrderUseCase,
            GetPurchaseOrderUseCase getPurchaseOrderUseCase
    ) {
        this.createPurchaseOrderUseCase = createPurchaseOrderUseCase;
        this.managePurchaseOrderUseCase = managePurchaseOrderUseCase;
        this.getPurchaseOrderUseCase = getPurchaseOrderUseCase;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/from-requisition")
    public ResponseEntity<PurchaseOrderResponse> createFromRequisition(
            @RequestBody CreatePurchaseOrderFromRequisitionRequest request
    ) {
        PurchaseOrderResponse response = createPurchaseOrderUseCase.createFromRequisition(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/{id}/issue")
    public ResponseEntity<PurchaseOrderResponse> issueOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(managePurchaseOrderUseCase.issueOrder(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponse> cancelOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(managePurchaseOrderUseCase.cancelOrder(id));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(getPurchaseOrderUseCase.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(getPurchaseOrderUseCase.getOrderById(id));
    }

    @GetMapping("/number/{poNumber}")
    public ResponseEntity<PurchaseOrderResponse> getOrderByPoNumber(@PathVariable String poNumber) {
        return ResponseEntity.ok(getPurchaseOrderUseCase.getOrderByPoNumber(poNumber));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrderResponse>> getOrdersByStatus(@PathVariable String status) {
        PurchaseOrderStatus poStatus = PurchaseOrderStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(getPurchaseOrderUseCase.getOrdersByStatus(poStatus));
    }
}

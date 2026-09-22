package com.exmple.stockpilot.purchaserequisition.presentation;

import com.exmple.stockpilot.purchaserequisition.application.port.in.CreatePurchaseRequisitionUseCase;
import com.exmple.stockpilot.purchaserequisition.application.port.in.GetPurchaseRequisitionUseCase;
import com.exmple.stockpilot.purchaserequisition.application.port.in.ManagePurchaseRequisitionUseCase;
import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
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
 * Contrôleur REST pour la gestion des Demandes d'Achat (DA / Purchase Requisition).
 * Rôles utilisateurs :
 * - Magasinier : Crée et soumet la DA suite à un besoin ou une alerte stock.
 * - Acheteur : Examine, approuve ou rejette la DA pour préparer le bon de commande.
 */
@RestController
@RequestMapping("/api/purchase-requisitions")
public class PurchaseRequisitionController {

    private final CreatePurchaseRequisitionUseCase createPurchaseRequisitionUseCase;
    private final ManagePurchaseRequisitionUseCase managePurchaseRequisitionUseCase;
    private final GetPurchaseRequisitionUseCase getPurchaseRequisitionUseCase;

    public PurchaseRequisitionController(
            CreatePurchaseRequisitionUseCase createPurchaseRequisitionUseCase,
            ManagePurchaseRequisitionUseCase managePurchaseRequisitionUseCase,
            GetPurchaseRequisitionUseCase getPurchaseRequisitionUseCase
    ) {
        this.createPurchaseRequisitionUseCase = createPurchaseRequisitionUseCase;
        this.managePurchaseRequisitionUseCase = managePurchaseRequisitionUseCase;
        this.getPurchaseRequisitionUseCase = getPurchaseRequisitionUseCase;
    }

    @PostMapping
    public ResponseEntity<PurchaseRequisitionResponse> createRequisition(@RequestBody CreatePurchaseRequisitionRequest request) {
        PurchaseRequisitionResponse response = createPurchaseRequisitionUseCase.createRequisition(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PurchaseRequisitionResponse>> getAllRequisitions() {
        return ResponseEntity.ok(getPurchaseRequisitionUseCase.getAllRequisitions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseRequisitionResponse> getRequisitionById(@PathVariable UUID id) {
        return ResponseEntity.ok(getPurchaseRequisitionUseCase.getRequisitionById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseRequisitionResponse>> getRequisitionsByStatus(@PathVariable String status) {
        PurchaseRequisitionStatus prStatus = PurchaseRequisitionStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(getPurchaseRequisitionUseCase.getRequisitionsByStatus(prStatus));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<PurchaseRequisitionResponse> submitRequisition(@PathVariable UUID id) {
        return ResponseEntity.ok(managePurchaseRequisitionUseCase.submitRequisition(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseRequisitionResponse> approveRequisition(@PathVariable UUID id) {
        return ResponseEntity.ok(managePurchaseRequisitionUseCase.approveRequisition(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PurchaseRequisitionResponse> rejectRequisition(
            @PathVariable UUID id,
            @RequestBody RejectPurchaseRequisitionRequest request
    ) {
        return ResponseEntity.ok(managePurchaseRequisitionUseCase.rejectRequisition(id, request.reason()));
    }
}

package com.exmple.stockpilot.purchasinginforecord.presentation;

import com.exmple.stockpilot.purchasinginforecord.application.service.PurchasingInfoRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour la gestion des Fiches Info Achat (Purchasing Info Record - PIR).
 * Associe un Article à un Fournisseur avec prix négocié, barème dégressif et lead time.
 */
@RestController
@RequestMapping("/api/purchasing-info-records")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
@RequiredArgsConstructor
public class PurchasingInfoRecordController {

    private final PurchasingInfoRecordService service;

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<PurchasingInfoRecordResponse> createOrUpdate(@RequestBody CreatePurchasingInfoRecordRequest request) {
        PurchasingInfoRecordResponse response = service.createOrUpdate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PurchasingInfoRecordResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<PurchasingInfoRecordResponse>> getByProductId(@PathVariable UUID productId) {
        return ResponseEntity.ok(service.getByProductId(productId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<PurchasingInfoRecordResponse> update(@PathVariable UUID id, @RequestBody CreatePurchasingInfoRecordRequest request) {
        PurchasingInfoRecordResponse response = service.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

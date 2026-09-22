package com.exmple.stockpilot.supplier.presentation;

import com.exmple.stockpilot.supplier.application.port.in.CreateSupplierUseCase;
import com.exmple.stockpilot.supplier.application.port.in.GetSupplierByIdUseCase;
import com.exmple.stockpilot.supplier.application.port.in.GetSupplierUseCase;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final CreateSupplierUseCase createSupplierUseCase;
    private final GetSupplierUseCase getSupplierUseCase;
    private final GetSupplierByIdUseCase getSupplierByIdUseCase;

    public SupplierController(
            CreateSupplierUseCase createSupplierUseCase,
            GetSupplierUseCase getSupplierUseCase,
            GetSupplierByIdUseCase getSupplierByIdUseCase
    ) {
        this.createSupplierUseCase = createSupplierUseCase;
        this.getSupplierUseCase = getSupplierUseCase;
        this.getSupplierByIdUseCase = getSupplierByIdUseCase;
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@RequestBody CreateSupplierRequest request) {
        SupplierResponse response = createSupplierUseCase.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        List<SupplierResponse> response = getSupplierUseCase.getAllSuppliers();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable UUID id) {
        SupplierResponse response = getSupplierByIdUseCase.getSupplierById(id);
        return ResponseEntity.ok(response);
    }
}

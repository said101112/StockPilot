package com.exmple.stockpilot.Warehouse.presentation;

import com.exmple.stockpilot.Warehouse.application.port.in.CreateWarehouseUseCase;
import com.exmple.stockpilot.Warehouse.application.port.in.GetWarehouseUseCase;
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
 * Adaptateur Primaire (REST Controller) pour la gestion de l'entrepôt.
 * En V1 : Conçu pour exploiter 1 entrepôt centralisé.
 */
@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final CreateWarehouseUseCase createWarehouseUseCase;
    private final GetWarehouseUseCase getWarehouseUseCase;

    public WarehouseController(
            CreateWarehouseUseCase createWarehouseUseCase,
            GetWarehouseUseCase getWarehouseUseCase
    ) {
        this.createWarehouseUseCase = createWarehouseUseCase;
        this.getWarehouseUseCase = getWarehouseUseCase;
    }

    @PostMapping
    public ResponseEntity<WarehouseResponse> createWarehouse(@RequestBody CreateWarehouseRequest request) {
        WarehouseResponse response = createWarehouseUseCase.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WarehouseResponse>> getAllWarehouses() {
        return ResponseEntity.ok(getWarehouseUseCase.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseResponse> getWarehouseById(@PathVariable UUID id) {
        return ResponseEntity.ok(getWarehouseUseCase.getWarehouseById(id));
    }

    @GetMapping("/default")
    public ResponseEntity<WarehouseResponse> getDefaultWarehouse() {
        return ResponseEntity.ok(getWarehouseUseCase.getDefaultWarehouse());
    }
}

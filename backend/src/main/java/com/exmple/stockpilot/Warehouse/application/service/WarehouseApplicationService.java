package com.exmple.stockpilot.Warehouse.application.service;

import com.exmple.stockpilot.Warehouse.application.port.in.CreateWarehouseUseCase;
import com.exmple.stockpilot.Warehouse.application.port.in.GetWarehouseUseCase;
import com.exmple.stockpilot.Warehouse.application.port.out.WarehouseRepository;
import com.exmple.stockpilot.Warehouse.domain.enums.WarehouseStatus;
import com.exmple.stockpilot.Warehouse.domain.model.Warehouse;
import com.exmple.stockpilot.Warehouse.domain.valueObject.Location;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.Warehouse.presentation.CreateWarehouseRequest;
import com.exmple.stockpilot.Warehouse.presentation.WarehouseResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class WarehouseApplicationService implements CreateWarehouseUseCase, GetWarehouseUseCase {

    private final WarehouseRepository warehouseRepository;

    public WarehouseApplicationService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    @Override
    public WarehouseResponse create(CreateWarehouseRequest request) {
        Location location = Location.create(
                request.address(),
                request.city(),
                request.country(),
                request.zipCode()
        );

        Warehouse warehouse = Warehouse.create(request.name(), location);
        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        return WarehouseResponse.from(savedWarehouse);
    }

    @Override
    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(WarehouseResponse::from)
                .toList();
    }

    @Override
    public WarehouseResponse getWarehouseById(UUID id) {
        return warehouseRepository.findById(WarehouseId.from(id))
                .map(WarehouseResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Warehouse not found with id: " + id));
    }

    @Override
    public WarehouseResponse getDefaultWarehouse() {
        // En V1 (1 seul entrepôt), on récupère le premier entrepôt actif
        return warehouseRepository.findAll().stream()
                .filter(w -> w.getStatus() == WarehouseStatus.ACTIVE)
                .findFirst()
                .map(WarehouseResponse::from)
                .orElseGet(() -> {
                    // Si aucun n'existe encore, on initialise l'entrepôt central par défaut
                    Location defaultLocation = Location.create("Zone Industrielle Nord", "Paris", "France", "75001");
                    Warehouse defaultWarehouse = Warehouse.create("Entrepôt Central", defaultLocation);
                    Warehouse saved = warehouseRepository.save(defaultWarehouse);
                    return WarehouseResponse.from(saved);
                });
    }
}

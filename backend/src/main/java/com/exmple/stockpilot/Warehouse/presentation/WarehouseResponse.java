package com.exmple.stockpilot.Warehouse.presentation;

import com.exmple.stockpilot.Warehouse.domain.model.Warehouse;

import java.util.UUID;

public record WarehouseResponse(
        UUID id,
        String name,
        String address,
        String city,
        String country,
        String zipCode,
        String status
) {
    public static WarehouseResponse from(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId().value(),
                warehouse.getName(),
                warehouse.getLocation().address(),
                warehouse.getLocation().city(),
                warehouse.getLocation().country(),
                warehouse.getLocation().zipCode(),
                warehouse.getStatus().name()
        );
    }
}

package com.exmple.stockpilot.Warehouse.presentation;

public record CreateWarehouseRequest(
        String name,
        String address,
        String city,
        String country,
        String zipCode
) {
}

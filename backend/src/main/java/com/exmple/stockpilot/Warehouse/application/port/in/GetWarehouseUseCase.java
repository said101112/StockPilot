package com.exmple.stockpilot.Warehouse.application.port.in;

import com.exmple.stockpilot.Warehouse.presentation.WarehouseResponse;

import java.util.List;
import java.util.UUID;

public interface GetWarehouseUseCase {
    List<WarehouseResponse> getAllWarehouses();
    WarehouseResponse getWarehouseById(UUID id);
    WarehouseResponse getDefaultWarehouse();
}

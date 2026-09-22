package com.exmple.stockpilot.Warehouse.application.port.in;

import com.exmple.stockpilot.Warehouse.presentation.CreateWarehouseRequest;
import com.exmple.stockpilot.Warehouse.presentation.WarehouseResponse;

public interface CreateWarehouseUseCase {
    WarehouseResponse create(CreateWarehouseRequest request);
}

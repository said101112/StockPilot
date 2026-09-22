package com.exmple.stockpilot.Warehouse.application.port.out;

import com.exmple.stockpilot.Warehouse.domain.model.Warehouse;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository {

    Warehouse save(Warehouse warehouse);

    Optional<Warehouse> findById(WarehouseId id);

    List<Warehouse> findAll();
}

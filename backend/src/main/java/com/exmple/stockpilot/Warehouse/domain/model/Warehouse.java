package com.exmple.stockpilot.Warehouse.domain.model;

import com.exmple.stockpilot.Warehouse.domain.enums.WarehouseStatus;
import com.exmple.stockpilot.Warehouse.domain.valueObject.Location;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;

public class Warehouse {

    private final WarehouseId id;
    private String name;
    private Location location;
    private WarehouseStatus status;

      public Warehouse(
            WarehouseId id,
            String name,
            Location location,
            WarehouseStatus status
    ) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.status = status != null ? status : WarehouseStatus.ACTIVE;
    }

      public static Warehouse create(String name, Location location) {
        return new Warehouse(
                WarehouseId.generate(),
                name,
                location,
                WarehouseStatus.ACTIVE
        );
    }

      public WarehouseId getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Location getLocation() {
        return location;
    }

    public WarehouseStatus getStatus() {
        return status;
    }
}



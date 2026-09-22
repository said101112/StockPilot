package com.exmple.stockpilot.Warehouse.domain.valueObject;
import java.util.Objects;
import java.util.UUID;



public record WarehouseId(UUID value) {
public WarehouseId {
Objects.requireNonNull(value, "WarehouseId value cannot be null");
}
public static WarehouseId generate() {
return new WarehouseId(UUID.randomUUID());
}
public static WarehouseId from(UUID value) {
return new WarehouseId(value);
}
}

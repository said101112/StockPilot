package com.exmple.stockpilot.Inventory.domain.valueObject;

import java.util.UUID;

public record InventoryId(UUID value) {
     public InventoryId{
        if (value == null) throw new IllegalArgumentException("InventoryId cannot be null");

     }
     public static InventoryId generate(){
        return new InventoryId(UUID.randomUUID());
     }
     public static InventoryId from(UUID value){
        return new InventoryId(value);
     }

    
}

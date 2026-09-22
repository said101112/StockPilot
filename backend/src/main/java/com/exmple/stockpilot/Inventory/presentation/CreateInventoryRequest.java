package com.exmple.stockpilot.Inventory.presentation;

public record CreateInventoryRequest(String productId,String warehouseId,int quantityInitial,int reorderPoint) {
    
}


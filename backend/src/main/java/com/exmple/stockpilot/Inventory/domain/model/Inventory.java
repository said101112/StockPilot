package com.exmple.stockpilot.Inventory.domain.model;

import com.exmple.stockpilot.Inventory.domain.enums.InventoryStatus;
import com.exmple.stockpilot.Inventory.domain.valueObject.InventoryId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;

public class Inventory {
   private InventoryId id;
   private ProductId productId;
   private WarehouseId warehouseId;
   private int quantityOnHand;
   private int reservedQuantity; 
   private int reorderPoint; 
   private InventoryStatus status;

   public Inventory(InventoryId id, ProductId productId, WarehouseId warehouseId, int quantityOnHand, int reservedQuantity, int reorderPoint, InventoryStatus status){
    this.id = id;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.quantityOnHand = quantityOnHand;
    this.reservedQuantity = reservedQuantity;
    this.reorderPoint = reorderPoint;
    this.status = status != null ? status : calculateStatus(quantityOnHand, reorderPoint, reservedQuantity);
   }
   public static Inventory create(ProductId productId, WarehouseId warehouseId, int quantityOnHand, int reorderPoint) {
      InventoryStatus initialStatus = calculateStatus(quantityOnHand, reorderPoint, 0);
      return new Inventory(
              InventoryId.generate(),
              productId,
              warehouseId,
              quantityOnHand,
              0,
              reorderPoint,
              initialStatus
      );
   }

   private static InventoryStatus calculateStatus(int quantityOnHand, int reorderPoint, int reservedQuantity) {
      int available = quantityOnHand - reservedQuantity;
      if (available <= 0) return InventoryStatus.OUT_OF_STOCK;
      if (available <= reorderPoint) return InventoryStatus.LOW_STOCK;
      return InventoryStatus.IN_STOCK;
   }

   // Getters
   public InventoryId getId() {
      return id;
   }

   public ProductId getProductId() {
      return productId;
   }

   public WarehouseId getWarehouseId() {
      return warehouseId;
   }

   public int getQuantityOnHand() {
      return quantityOnHand;
   }

   public int getReservedQuantity() {
      return reservedQuantity;
   }

   public int getReorderPoint() {
      return reorderPoint;
   }

   public InventoryStatus getStatus() {
      return status;
   }

   public int getAvailableQuantity() {
      return quantityOnHand - reservedQuantity;
   }
   public void reserveStock(int qty){
    if(qty>getAvailableQuantity()) throw new IllegalStateException("Not enough stock to reserve");
    this.reservedQuantity += qty;
    this.status = calculateStatus(quantityOnHand, reorderPoint, reservedQuantity);
   }
   public void increaseStock(int qty){
    if (qty<=0) throw new IllegalArgumentException("Quantity must be positive");
    this.quantityOnHand += qty;
    this.status = calculateStatus(quantityOnHand, reorderPoint, reservedQuantity);
   } 
   public void consumeStock(int qty){
    if (qty <= 0) throw new IllegalArgumentException("Quantity must be positive");
    if (qty > quantityOnHand) throw new IllegalStateException("Not enough stock to consume");
    this.quantityOnHand -= qty;
    this.status = calculateStatus(quantityOnHand, reorderPoint, reservedQuantity);
   }
   public void releaseStock(int qty){
    if (qty <= 0) throw new IllegalArgumentException("Quantity must be positive");
    if (qty > reservedQuantity) throw new IllegalStateException("Not enough reserved stock to release");
    this.reservedQuantity -= qty;
    this.status = calculateStatus(quantityOnHand, reorderPoint, reservedQuantity);
   }

   public void scrapStock(int qty) {
       if (qty <= 0) {
           throw new IllegalArgumentException("Scrap quantity must be positive");
       }
       if (qty > getAvailableQuantity()) {
           throw new IllegalStateException("Not enough available stock to scrap (requested: " + qty + ", available: " + getAvailableQuantity() + ")");
       }
       this.quantityOnHand -= qty;
       this.status = calculateStatus(quantityOnHand, reorderPoint, reservedQuantity);
   }

   public boolean isBelowReorderPoint() {
       return getAvailableQuantity() <= reorderPoint;
   }

   public boolean isOutOfStock() {
       return getAvailableQuantity() <= 0;
   }
}

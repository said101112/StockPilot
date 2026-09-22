export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  status: StockStatus;
}

export interface ScrapStockRequest {
  quantity: number;
  reason: string;
  operator: string;
}

export interface ScrapInventoryResponse {
  inventoryId: string;
  productId: string;
  warehouseId: string;
  quantityScrapped: number;
  remainingStock: number;
  remainingAvailable: number;
  reorderPoint: number;
  status: StockStatus;
  movementNumber: string;
  scrapReason: string;
  operator: string;
  alertTriggered: boolean;
}

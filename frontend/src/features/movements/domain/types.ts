export type MovementType =
  | "GOODS_RECEIPT_PO"
  | "INTERNAL_CONSUMPTION"
  | "INITIAL_STOCK"
  | "MANUAL_ADJUSTMENT"
  | "SCRAP_DAMAGED";

export interface StockMovement {
  id: string;
  movementNumber: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  referenceDocument: string;
  timestamp: string;
}

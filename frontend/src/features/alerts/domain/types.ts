export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "ACTIVE" | "RESOLVED";

export interface StockAlert {
  id: string;
  productId: string;
  warehouseId: string;
  currentStock: number;
  reorderPoint: number;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
}

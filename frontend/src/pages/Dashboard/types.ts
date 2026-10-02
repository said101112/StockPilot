import type { StockAlert } from "@/features/alerts/domain/types";
import type { StockMovement } from "@/features/movements/domain/types";
import type { Product } from "@/features/products/domain/types";

export interface DashboardStats {
  totalStockCount: number;
  totalValuation: number;
  activeAlertsCount: number;
  openOrdersCount: number;
  openOrdersValue: number;
  totalMovementsCount: number;
  totalSuppliersCount: number;
  totalProductsCount: number;
  pendingRequisitionsCount: number;
}

export interface StockHealth {
  inStockPct: number;
  lowStockPct: number;
  outOfStockPct: number;
}

export interface RoleDashboardProps {
  stats: DashboardStats;
  alerts: StockAlert[];
  recentMovements: StockMovement[];
  productMap: Record<string, Product>;
  stockHealth: StockHealth;
  loading: boolean;
  onRefresh: () => void;
  onCreateRequisition: (productId?: string) => void;
  onCreateSupplier?: () => void;
  onCreateProduct?: () => void;
}

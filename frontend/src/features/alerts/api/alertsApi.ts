import { apiClient } from "@/shared/api/httpClient";
import type { StockAlert } from "../domain/types";

export const alertsApi = {
  getAll: () => apiClient<StockAlert[]>("/api/stock-alerts"),
  getActive: () => apiClient<StockAlert[]>("/api/stock-alerts/active"),
};

import { apiClient } from "@/shared/api/httpClient";
import type { StockMovement } from "../domain/types";

export const movementsApi = {
  getAll: () => apiClient<StockMovement[]>("/api/stock-movements"),
  getByProductId: (productId: string) =>
    apiClient<StockMovement[]>(`/api/stock-movements/product/${productId}`),
};

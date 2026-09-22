import { apiClient } from "@/shared/api/httpClient";
import type { InventoryItem, ScrapStockRequest, ScrapInventoryResponse } from "../domain/types";

export const inventoryApi = {
  getAll: () => apiClient<InventoryItem[]>("/api/inventories"),
  
  getById: (id: string) => apiClient<InventoryItem>(`/api/inventories/${id}`),

  scrapStock: (id: string, data: ScrapStockRequest) =>
    apiClient<ScrapInventoryResponse>(`/api/inventories/${id}/scrap`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  consumeStock: (id: string, quantity: number) =>
    apiClient<InventoryItem>(`/api/inventories/${id}/consume`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),

  increaseStock: (id: string, quantity: number) =>
    apiClient<InventoryItem>(`/api/inventories/${id}/increase`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),
};

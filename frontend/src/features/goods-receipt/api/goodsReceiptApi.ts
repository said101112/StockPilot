import { apiClient } from "@/shared/api/httpClient";
import type { CreateGoodsReceiptRequest, GoodsReceipt } from "../domain/types";

export const goodsReceiptApi = {
  getAll: () => apiClient<GoodsReceipt[]>("/api/goods-receipts"),
  getById: (id: string) => apiClient<GoodsReceipt>(`/api/goods-receipts/${id}`),
  create: (data: CreateGoodsReceiptRequest) =>
    apiClient<GoodsReceipt>("/api/goods-receipts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

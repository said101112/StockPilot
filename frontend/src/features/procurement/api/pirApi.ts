import { httpClient } from "@/shared/api/httpClient";
import type {
  PurchasingInfoRecord,
  CreatePurchasingInfoRecordData,
} from "../domain/types";

export const pirApi = {
  getAll: (): Promise<PurchasingInfoRecord[]> =>
    httpClient.get<PurchasingInfoRecord[]>("/purchasing-info-records"),

  getByProductId: (productId: string): Promise<PurchasingInfoRecord[]> =>
    httpClient.get<PurchasingInfoRecord[]>(`/purchasing-info-records/product/${productId}`),

  create: (data: CreatePurchasingInfoRecordData): Promise<PurchasingInfoRecord> =>
    httpClient.post<PurchasingInfoRecord>("/purchasing-info-records", data),

  update: (id: string, data: Partial<CreatePurchasingInfoRecordData>): Promise<PurchasingInfoRecord> =>
    httpClient.put<PurchasingInfoRecord>(`/purchasing-info-records/${id}`, data),

  delete: (id: string): Promise<void> =>
    httpClient.delete<void>(`/purchasing-info-records/${id}`),
};

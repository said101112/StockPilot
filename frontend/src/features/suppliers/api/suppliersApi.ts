import { httpClient } from "@/shared/api/httpClient";
import type { Supplier, CreateSupplierDto } from "../domain/types";

export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    return httpClient.get<Supplier[]>("/suppliers");
  },

  getById: async (id: string): Promise<Supplier> => {
    return httpClient.get<Supplier>(`/suppliers/${id}`);
  },

  create: async (data: CreateSupplierDto): Promise<Supplier> => {
    return httpClient.post<Supplier>("/suppliers", data);
  },
};

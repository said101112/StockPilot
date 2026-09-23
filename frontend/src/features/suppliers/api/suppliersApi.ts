import { httpClient } from "@/shared/api/httpClient";
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "../domain/types";

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

  update: async (id: string, data: UpdateSupplierDto): Promise<Supplier> => {
    return httpClient.put<Supplier>(`/suppliers/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/suppliers/${id}`);
  },
};

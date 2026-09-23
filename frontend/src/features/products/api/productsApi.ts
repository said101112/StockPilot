import { httpClient } from "@/shared/api/httpClient";
import type { Product, CreateProductDto, UpdateProductDto } from "../domain/types";

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    return httpClient.get<Product[]>("/products");
  },

  getById: async (id: string): Promise<Product> => {
    return httpClient.get<Product>(`/products/${id}`);
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    // 1. Créer le produit dans le catalogue
    const product = await httpClient.post<Product>("/products", {
      name: data.name,
      description: data.description,
      sku: data.sku,
      price: data.price,
      currency: data.currency || "EUR",
      unitOfMeasure: data.unitOfMeasure || "PCS",
      category: data.category || "FINISHED_GOOD",
    });

    // 2. Si un stock initial ou seuil d'alerte est renseigné, initialiser l'inventaire
    if ((data.initialStock !== undefined && data.initialStock > 0) || (data.reorderPoint !== undefined && data.reorderPoint > 0)) {
      try {
        const defaultWh = await httpClient.get<{ id: string }>("/warehouses/default");
        if (defaultWh?.id) {
          await httpClient.post("/inventories", {
            productId: product.id,
            warehouseId: defaultWh.id,
            quantityInitial: data.initialStock || 0,
            reorderPoint: data.reorderPoint || 10,
          });
        }
      } catch {
        // En cas d'erreur sur l'inventaire, le produit est tout de même créé
      }
    }

    return product;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    return httpClient.put<Product>(`/products/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/products/${id}`);
  },
};

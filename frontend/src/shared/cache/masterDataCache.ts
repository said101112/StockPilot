import { productsApi } from "@/features/products/api/productsApi";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import { httpClient } from "@/shared/api/httpClient";
import type { Product } from "@/features/products/domain/types";
import type { Supplier } from "@/features/suppliers/domain/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes de cache en mémoire

let productsCache: CacheEntry<Product[]> | null = null;
let suppliersCache: CacheEntry<Supplier[]> | null = null;
let warehousesCache: CacheEntry<Array<{ id: string; name: string }>> | null = null;

export const masterDataCache = {
  // Récupérer les articles (en mémoire si frais, sinon appel réseau)
  getProducts: async (forceRefresh = false): Promise<Product[]> => {
    const now = Date.now();
    if (!forceRefresh && productsCache && now - productsCache.timestamp < CACHE_TTL_MS) {
      return productsCache.data;
    }
    const data = await productsApi.getAll().catch(() => []);
    productsCache = { data, timestamp: now };
    return data;
  },

  // Récupérer les fournisseurs (en mémoire si frais, sinon appel réseau)
  getSuppliers: async (forceRefresh = false): Promise<Supplier[]> => {
    const now = Date.now();
    if (!forceRefresh && suppliersCache && now - suppliersCache.timestamp < CACHE_TTL_MS) {
      return suppliersCache.data;
    }
    const data = await suppliersApi.getAll().catch(() => []);
    suppliersCache = { data, timestamp: now };
    return data;
  },

  // Récupérer les entrepôts
  getWarehouses: async (forceRefresh = false): Promise<Array<{ id: string; name: string }>> => {
    const now = Date.now();
    if (!forceRefresh && warehousesCache && now - warehousesCache.timestamp < CACHE_TTL_MS) {
      return warehousesCache.data;
    }
    const data = await httpClient.get<Array<{ id: string; name: string }>>("/warehouses").catch(() => []);
    warehousesCache = { data, timestamp: now };
    return data;
  },

  // Invalider le cache lors d'une mutation (création/modification)
  invalidate: (key: "products" | "suppliers" | "warehouses" | "all") => {
    if (key === "products" || key === "all") productsCache = null;
    if (key === "suppliers" || key === "all") suppliersCache = null;
    if (key === "warehouses" || key === "all") warehousesCache = null;
  },
};

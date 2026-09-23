import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { ScrapModal } from "@/features/inventory/components/ScrapModal";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { productsApi } from "@/features/products/api/productsApi";
import { httpClient } from "@/shared/api/httpClient";
import type { InventoryItem, ScrapInventoryResponse } from "@/features/inventory/domain/types";
import type { Product } from "@/features/products/domain/types";
import {
  Package,
  RefreshCw,
  Flame,
  AlertTriangle,
  BellRing,
  X,
  Warehouse,
} from "lucide-react";

interface WarehouseInfo {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lastScrapResult, setLastScrapResult] = useState<ScrapInventoryResponse | null>(null);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, prods, warehouses] = await Promise.all([
        inventoryApi.getAll(),
        productsApi.getAll().catch(() => []),
        httpClient.get<WarehouseInfo[]>("/warehouses").catch(() => []),
      ]);

      setInventories(invData);

      const pMap: Record<string, Product> = {};
      prods.forEach((p) => {
        pMap[p.id] = p;
      });
      setProductMap(pMap);

      const wMap: Record<string, string> = {};
      if (Array.isArray(warehouses)) {
        warehouses.forEach((w) => {
          wMap[w.id] = w.name;
        });
      }
      setWarehouseMap(wMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Impossible de charger l'inventaire");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const handleOpenScrap = (inv: InventoryItem) => {
    setSelectedInventory(inv);
    setIsModalOpen(true);
  };

  const handleScrapSuccess = (result: ScrapInventoryResponse) => {
    setLastScrapResult(result);
    fetchInventories();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_STOCK":
        return <Badge color="success">Stock Conforme</Badge>;
      case "LOW_STOCK":
        return <Badge color="warning">Seuil Atteint</Badge>;
      case "OUT_OF_STOCK":
        return <Badge color="error">Rupture de Stock</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Inventaire & Stocks
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              État des stocks physiques, seuils d'alerte et déclarations de casse
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchInventories} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Notification après déclaration de casse */}
      {lastScrapResult && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-300">
                  Déclaration de casse enregistrée avec succès
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  N° Mouvement : <strong>{lastScrapResult.movementNumber}</strong> | Sortie de stock : -
                  {lastScrapResult.quantityScrapped} PCS (Motif : {lastScrapResult.scrapReason})
                </p>
                {lastScrapResult.alertTriggered && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
                    <BellRing className="h-4 w-4" />
                    <span>
                      Stock sous le seuil ({lastScrapResult.remainingStock} ≤ {lastScrapResult.reorderPoint} PCS) : Une Alerte de Réapprovisionnement a été déclenchée automatiquement !
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setLastScrapResult(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tableau d'Inventaire Spécifique et Clair */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Article & Référence</th>
                <th className="px-6 py-4">Entrepôt Magasin</th>
                <th className="px-6 py-4 text-center">Stock Physique</th>
                <th className="px-6 py-4 text-center">Réservé</th>
                <th className="px-6 py-4 text-center">Disponible</th>
                <th className="px-6 py-4 text-center">Point de Réappro</th>
                <th className="px-6 py-4">État du Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement de l'inventaire en cours...
                  </td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucun inventaire trouvé</p>
                    <p className="text-xs text-gray-400">Initialisez du stock depuis le catalogue articles.</p>
                  </td>
                </tr>
              ) : (
                inventories.map((inv) => {
                  const product = productMap[inv.productId];
                  const whName = warehouseMap[inv.warehouseId] || "Entrepôt Marseille Port";

                  return (
                    <tr
                      key={inv.id}
                      className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {product ? product.name : "Article"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            Réf : {product ? product.sku : inv.productId.substring(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                          <Warehouse className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                          <span>{whName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-gray-900 dark:text-white">
                        {inv.quantityOnHand} PCS
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-gray-500">
                        {inv.reservedQuantity} PCS
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-brand-600 dark:text-brand-400">
                        {inv.availableQuantity} PCS
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-medium text-gray-500">
                        {inv.reorderPoint} PCS
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenScrap(inv)}
                          disabled={inv.availableQuantity <= 0}
                          className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-400 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          <Flame className="h-3.5 w-3.5" />
                          Déclarer une Casse
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Déclaration de Casse / Rebut */}
      {selectedInventory && (
        <ScrapModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInventory(null);
          }}
          onSuccess={handleScrapSuccess}
          inventory={selectedInventory}
        />
      )}
    </div>
  );
}

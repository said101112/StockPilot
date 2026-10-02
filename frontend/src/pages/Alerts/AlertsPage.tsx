import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { alertsApi } from "@/features/alerts/api/alertsApi";
import { masterDataCache } from "@/shared/cache/masterDataCache";
import type { StockAlert } from "@/features/alerts/domain/types";
import type { Product } from "@/features/products/domain/types";
import CreateRequisitionModal from "@/features/procurement/components/CreateRequisitionModal";
import { AlertTriangle, RefreshCw, Warehouse, ShieldAlert, CheckCircle2, ShoppingCart } from "lucide-react";

import { ModernStatusBadge } from "@/components/common/ModernStatusBadge";
import { DateCell } from "@/components/common/DateCell";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination hook
  const pagination = usePagination({ items: alerts, initialPageSize: 10 });

  // Modal DA state
  const [selectedProductIdForDA, setSelectedProductIdForDA] = useState<string>("");
  const [isDAModalOpen, setIsDAModalOpen] = useState<boolean>(false);

  const fetchAlerts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const [alertsData, prods, warehouses] = await Promise.all([
        alertsApi.getAll(),
        masterDataCache.getProducts(forceRefresh),
        masterDataCache.getWarehouses(forceRefresh),
      ]);

      // Tri strict : Les alertes les plus récentes en premier
      const sortedAlerts = [...(alertsData || [])].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setAlerts(sortedAlerts);

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
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateDAFromAlert = (productId: string) => {
    setSelectedProductIdForDA(productId);
    setIsDAModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Alertes de Stock
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Articles ayant franchi le seuil d'alerte minimum
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={fetchAlerts} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tableau des Alertes Spécifique et Clair */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Article & Référence</th>
                <th className="px-6 py-4">Date Détection</th>
                <th className="px-6 py-4">Entrepôt</th>
                <th className="px-6 py-4 text-center">Stock Actuel</th>
                <th className="px-6 py-4 text-center">Seuil Minimum</th>
                <th className="px-6 py-4 text-center">Niveau d'Urgence</th>
                <th className="px-6 py-4 text-center">État Alerte</th>
                <th className="px-6 py-4 text-right">Actions Logistiques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des alertes...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucune alerte active</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tous les stocks respectent actuellement leurs seuils de sécurité.
                    </p>
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((al) => {
                  const product = productMap[al.productId];
                  const whName = warehouseMap[al.warehouseId] || "Entrepôt Marseille Port";

                  return (
                    <tr
                      key={al.id}
                      className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {product ? product.name : "Article"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            Réf : {product ? product.sku : al.productId.substring(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DateCell date={al.createdAt} updatedDate={al.resolvedAt} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <Warehouse className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{whName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {al.currentStock} PCS
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-gray-300 font-mono">
                        {al.reorderPoint} PCS
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ModernStatusBadge status={al.severity} fixedWidth={true} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ModernStatusBadge status={al.status} fixedWidth={true} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {al.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleCreateDAFromAlert(al.productId)}
                            className="gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Créer Demande d'Achat
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Régularisée</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} />
      </div>

      {/* Modal DA pré-remplie */}
      <CreateRequisitionModal
        isOpen={isDAModalOpen}
        onClose={() => setIsDAModalOpen(false)}
        onSuccess={() => {
          fetchAlerts();
        }}
        initialProductId={selectedProductIdForDA}
      />
    </div>
  );
}

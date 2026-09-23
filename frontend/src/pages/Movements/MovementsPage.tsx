import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { movementsApi } from "@/features/movements/api/movementsApi";
import { productsApi } from "@/features/products/api/productsApi";
import { httpClient } from "@/shared/api/httpClient";
import type { StockMovement } from "@/features/movements/domain/types";
import type { Product } from "@/features/products/domain/types";
import { History, RefreshCw, AlertCircle, FileSpreadsheet, ArrowUpRight, ArrowDownLeft, Warehouse } from "lucide-react";

interface WarehouseInfo {
  id: string;
  name: string;
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const [movementsData, prods, warehouses] = await Promise.all([
        movementsApi.getAll(),
        productsApi.getAll().catch(() => []),
        httpClient.get<WarehouseInfo[]>("/warehouses").catch(() => []),
      ]);

      setMovements(movementsData || []);

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
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "GOODS_RECEIPT_PO":
        return <Badge color="success">Réception Fournisseur</Badge>;
      case "SCRAP_DAMAGED":
        return <Badge color="error">Casse / Rebut Déclaré</Badge>;
      case "INTERNAL_CONSUMPTION":
        return <Badge color="warning">Sortie Atelier</Badge>;
      case "INITIAL_STOCK":
        return <Badge color="primary">Inventaire Initial</Badge>;
      case "MANUAL_ADJUSTMENT":
        return <Badge color="light">Régularisation</Badge>;
      default:
        return <Badge color="light">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Historique des Mouvements
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Journal de traçabilité des entrées, sorties et déclarations de casse
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={fetchMovements} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tableau des Mouvements Clair et Spécifique */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Mouvement</th>
                <th className="px-6 py-4">Opération Logistique</th>
                <th className="px-6 py-4">Article & Référence</th>
                <th className="px-6 py-4">Entrepôt</th>
                <th className="px-6 py-4 text-center">Quantité</th>
                <th className="px-6 py-4">Document / Motif</th>
                <th className="px-6 py-4 text-right">Date & Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des mouvements...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucun mouvement enregistré</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Les mouvements apparaîtront dès vos premières réceptions ou sorties.
                    </p>
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const product = productMap[mov.productId];
                  const whName = warehouseMap[mov.warehouseId] || "Entrepôt Marseille Port";

                  return (
                    <tr
                      key={mov.id}
                      className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                        {mov.movementNumber}
                      </td>
                      <td className="px-6 py-4">{getMovementBadge(mov.type)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {product ? product.name : "Article"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            Réf : {product ? product.sku : mov.productId.substring(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <Warehouse className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{whName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold">
                        <div className="flex items-center justify-center gap-1">
                          {mov.quantity > 0 ? (
                            <span className="flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                              <ArrowUpRight className="h-4 w-4 mr-0.5" />
                              +{mov.quantity} PCS
                            </span>
                          ) : (
                            <span className="flex items-center font-semibold text-rose-600 dark:text-rose-400">
                              <ArrowDownLeft className="h-4 w-4 mr-0.5" />
                              {mov.quantity} PCS
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {mov.referenceDocument || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-gray-500">
                        {new Date(mov.timestamp).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

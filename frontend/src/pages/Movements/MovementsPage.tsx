import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { movementsApi } from "@/features/movements/api/movementsApi";
import type { StockMovement } from "@/features/movements/domain/types";
import { History, RefreshCw, AlertCircle, FileSpreadsheet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movementsApi.getAll();
      setMovements(data || []);
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
        return <Badge color="success">ENTRÉE MARCHANDISE (SAP 101)</Badge>;
      case "SCRAP_DAMAGED":
        return <Badge color="error">CASSE / REBUT (SAP 551)</Badge>;
      case "INTERNAL_CONSUMPTION":
        return <Badge color="warning">SORTIE ATELIER / USAGE (SAP 201)</Badge>;
      case "INITIAL_STOCK":
        return <Badge color="primary">INVENTAIRE INITIAL (SAP 561)</Badge>;
      case "MANUAL_ADJUSTMENT":
        return <Badge color="light">RÉGULARISATION MANUELLE</Badge>;
      default:
        return <Badge color="light">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Grand Livre d'Audit des Mouvements de Stock
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Journal immuable traçant chaque entrée, sortie atelier et mise au rebut (Material Documents SAP MM)
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Pièce Mouvement</th>
                <th className="px-6 py-4">Type de Mouvement SAP</th>
                <th className="px-6 py-4">Article (Produit)</th>
                <th className="px-6 py-4">Entrepôt</th>
                <th className="px-6 py-4 text-center">Flux Quantité</th>
                <th className="px-6 py-4">Document de Référence</th>
                <th className="px-6 py-4 text-right">Horodatage</th>
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
                    <p className="text-xs text-gray-400">Les mouvements seront listés ici dès les premières opérations.</p>
                  </td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr
                    key={mov.id}
                    className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {mov.movementNumber}
                    </td>
                    <td className="px-6 py-4">{getMovementBadge(mov.type)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {mov.productId.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {mov.warehouseId.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold">
                      <div className="flex items-center justify-center gap-1">
                        {mov.quantity > 0 ? (
                          <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                            +{mov.quantity} PCS
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 dark:text-rose-400">
                            <ArrowDownLeft className="h-3.5 w-3.5 mr-0.5" />
                            {mov.quantity} PCS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {mov.referenceDocument || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">
                      {new Date(mov.timestamp).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

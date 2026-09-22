import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { movementsApi } from "@/features/movements/api/movementsApi";
import type { StockMovement } from "@/features/movements/domain/types";

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movementsApi.getAll();
      setMovements(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des mouvements");
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📜 Grand Livre d'Audit des Mouvements de Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Journal immuable traçant chaque entrée, sortie atelier et mise au rebut (Material Documents SAP MM)
          </p>
        </div>
        <Button variant="outline" onClick={fetchMovements} disabled={loading}>
          🔄 Actualiser
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Mouvement</th>
                <th className="px-6 py-4">Article (Product ID)</th>
                <th className="px-6 py-4">Type de Mouvement SAP</th>
                <th className="px-6 py-4 text-center">Quantité</th>
                <th className="px-6 py-4">Document Référence / Justification</th>
                <th className="px-6 py-4 text-right">Horodatage Précis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Chargement du journal d'audit...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun mouvement de stock enregistré.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const isNegative =
                    mov.type === "SCRAP_DAMAGED" || mov.type === "INTERNAL_CONSUMPTION";
                  return (
                    <tr
                      key={mov.id}
                      className="hover:bg-gray-50/50 transition dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                        {mov.movementNumber}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {mov.productId.substring(0, 16)}...
                      </td>
                      <td className="px-6 py-4">{getMovementBadge(mov.type)}</td>
                      <td
                        className={`px-6 py-4 text-center font-bold ${
                          isNegative
                            ? "text-error-600 dark:text-error-400"
                            : "text-success-600 dark:text-success-400"
                        }`}
                      >
                        {isNegative ? "-" : "+"}
                        {mov.quantity} PCS
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300">
                        {mov.referenceDocument}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500">
                        {new Date(mov.timestamp).toLocaleString("fr-FR")}
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

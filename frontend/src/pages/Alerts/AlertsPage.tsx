import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { alertsApi } from "@/features/alerts/api/alertsApi";
import type { StockAlert } from "@/features/alerts/domain/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertsApi.getAll();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <Badge color="error">CRITIQUE (RUPTURE / 0 PCS)</Badge>;
      case "HIGH":
        return <Badge color="warning">ÉLEVÉE (≤ 50% DU SEUIL)</Badge>;
      case "MEDIUM":
        return <Badge color="primary">MOYENNE (POINT DE COMMANDE)</Badge>;
      default:
        return <Badge color="light">{sev}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge color="error">ACTIVE (RÉAPPROQUISITION REQUISE)</Badge>;
      case "RESOLVED":
        return <Badge color="success">RÉSOLUE (STOCK RÉAPPROVISIONNÉ)</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚨 Alertes Automatiques de Réapprovisionnement
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Déclenchées automatiquement par le moteur de stock dès franchissement du seuil ou mise au rebut
          </p>
        </div>
        <Button variant="outline" onClick={fetchAlerts} disabled={loading}>
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
                <th className="px-6 py-4">Article (Product ID)</th>
                <th className="px-6 py-4">Entrepôt</th>
                <th className="px-6 py-4 text-center">Stock au Déclenchement</th>
                <th className="px-6 py-4 text-center">Seuil Minimum</th>
                <th className="px-6 py-4">Sévérité</th>
                <th className="px-6 py-4">Statut Alerte</th>
                <th className="px-6 py-4 text-right">Date Émission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Chargement des alertes...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucune alerte enregistrée.
                  </td>
                </tr>
              ) : (
                alerts.map((al) => (
                  <tr
                    key={al.id}
                    className="hover:bg-gray-50/50 transition dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {al.productId}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {al.warehouseId.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-error-600 dark:text-error-400">
                      {al.currentStock} PCS
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                      {al.reorderPoint} PCS
                    </td>
                    <td className="px-6 py-4">{getSeverityBadge(al.severity)}</td>
                    <td className="px-6 py-4">{getStatusBadge(al.status)}</td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(al.createdAt).toLocaleString("fr-FR")}
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

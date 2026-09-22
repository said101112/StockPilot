import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { alertsApi } from "@/features/alerts/api/alertsApi";
import type { StockAlert } from "@/features/alerts/domain/types";
import { AlertTriangle, RefreshCw, Warehouse, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertsApi.getAll();
      setAlerts(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des alertes");
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
        return <Badge color="error">CRITIQUE (0 PCS)</Badge>;
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
        return <Badge color="success">RÉSOLUE (STOCK CONFORME)</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Alertes Automatiques de Réapprovisionnement
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Déclenchées automatiquement par le moteur de stock dès franchissement du seuil ou mise au rebut (SAP MM)
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
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
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des alertes...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucune alerte active</p>
                    <p className="text-xs text-gray-400">Tous les stocks respectent les points de commande.</p>
                  </td>
                </tr>
              ) : (
                alerts.map((al) => (
                  <tr
                    key={al.id}
                    className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {al.productId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Warehouse className="h-3.5 w-3.5 text-gray-400" />
                        <span>{al.warehouseId.substring(0, 16)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {al.currentStock} PCS
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-gray-300 font-mono">
                      {al.reorderPoint} PCS
                    </td>
                    <td className="px-6 py-4">{getSeverityBadge(al.severity)}</td>
                    <td className="px-6 py-4">{getStatusBadge(al.status)}</td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500 font-mono">
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

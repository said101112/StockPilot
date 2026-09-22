import { useEffect, useState } from "react";
import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { alertsApi } from "@/features/alerts/api/alertsApi";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import { movementsApi } from "@/features/movements/api/movementsApi";
import type { StockAlert } from "@/features/alerts/domain/types";
import type { StockMovement } from "@/features/movements/domain/types";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStockCount: 0,
    activeAlertsCount: 0,
    openOrdersCount: 0,
    totalMovementsCount: 0,
  });
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [invList, alertList, poList, movList] = await Promise.all([
        inventoryApi.getAll().catch(() => []),
        alertsApi.getActive().catch(() => []),
        procurementApi.getOrders().catch(() => []),
        movementsApi.getAll().catch(() => []),
      ]);

      setStats({
        totalStockCount: invList.reduce((acc, curr) => acc + curr.quantityOnHand, 0),
        activeAlertsCount: alertList.length,
        openOrdersCount: poList.filter((po) => po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED").length,
        totalMovementsCount: movList.length,
      });

      setAlerts(alertList.slice(0, 5));
      setRecentMovements(movList.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <Badge color="error">CRITIQUE (0 PCS)</Badge>;
      case "HIGH":
        return <Badge color="warning">ÉLEVÉE (≤ 50% seuil)</Badge>;
      case "MEDIUM":
        return <Badge color="primary">MOYENNE (≤ seuil)</Badge>;
      default:
        return <Badge color="light">{sev}</Badge>;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "GOODS_RECEIPT_PO":
        return <Badge color="success">ENTRÉE PO (SAP 101)</Badge>;
      case "SCRAP_DAMAGED":
        return <Badge color="error">CASSE / REBUT (SAP 551)</Badge>;
      case "INTERNAL_CONSUMPTION":
        return <Badge color="warning">SORTIE ATELIER (SAP 201)</Badge>;
      case "INITIAL_STOCK":
        return <Badge color="primary">INIT STOCK (SAP 561)</Badge>;
      default:
        return <Badge color="light">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Cockpit Exécutif StockPilot (SAP MM)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supervision en temps réel du cycle Procure-to-Pay, de l'état des stocks et des rebuts
          </p>
        </div>
        <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
          🔄 Rafraîchir les données
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Stock Physique Total
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              📦
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.totalStockCount} <span className="text-sm font-normal text-gray-500">PCS</span>
            </h3>
            <p className="mt-1 text-xs text-success-600 dark:text-success-400">
              En direct de la base centrale
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Alertes de Stock Actives
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
              🚨
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-error-600 dark:text-error-400">
              {stats.activeAlertsCount}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Articles au seuil de réapprovisionnement
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Commandes Fournisseur (PO)
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400">
              📄
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.openOrdersCount}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              En cours de livraison / émis
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Mouvements Traçables
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
              📜
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.totalMovementsCount}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Grand livre d'audit immuable
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Alerts + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Alerts Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Alertes Récentes à Traiter
              </h2>
            </div>
            <Link
              to="/alerts"
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Voir toutes les alertes →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                ✅ Aucune alerte active. Tous les stocks sont au-dessus de leur point de commande.
              </p>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="space-y-1">
                    <p className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                      Article {al.productId.substring(0, 16)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock actuel : <strong>{al.currentStock} PCS</strong> | Seuil de commande :{" "}
                      <strong>{al.reorderPoint} PCS</strong>
                    </p>
                  </div>
                  <div>{getSeverityBadge(al.severity)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & SAP MM Shortcuts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            ⚡ Raccourcis Processus
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Opérations directes sur la chaîne logistique
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link to="/inventory">
              <Button variant="outline" className="w-full justify-start text-left">
                💥 Déclarer Casse / Rebut (SAP 551)
              </Button>
            </Link>
            <Link to="/requisitions">
              <Button variant="outline" className="w-full justify-start text-left">
                📝 Créer une Demande d'Achat (DA)
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline" className="w-full justify-start text-left">
                📄 Suivre les Bons de Commande (PO)
              </Button>
            </Link>
            <Link to="/goods-receipt">
              <Button variant="outline" className="w-full justify-start text-left">
                📥 Enregistrer une Réception (MIGO)
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Movements Audit Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Derniers Mouvements de Stock (Traçabilité Audit SAP)
            </h2>
          </div>
          <Link
            to="/movements"
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Consulter l'audit complet →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="py-3">N° Mouvement</th>
                <th className="py-3">Type SAP</th>
                <th className="py-3 text-center">Quantité</th>
                <th className="py-3">Référence / Motif</th>
                <th className="py-3 text-right">Horodatage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    Aucun mouvement enregistré.
                  </td>
                </tr>
              ) : (
                recentMovements.map((mov) => (
                  <tr key={mov.id}>
                    <td className="py-3 font-mono font-bold text-gray-900 dark:text-white">
                      {mov.movementNumber}
                    </td>
                    <td className="py-3">{getMovementTypeBadge(mov.type)}</td>
                    <td className="py-3 text-center font-bold text-gray-900 dark:text-white">
                      {mov.type === "SCRAP_DAMAGED" || mov.type === "INTERNAL_CONSUMPTION" ? "-" : "+"}
                      {mov.quantity} PCS
                    </td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400">
                      {mov.referenceDocument}
                    </td>
                    <td className="py-3 text-right text-xs text-gray-500">
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

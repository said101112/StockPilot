import { useEffect, useState } from "react";
import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { alertsApi } from "@/features/alerts/api/alertsApi";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import { movementsApi } from "@/features/movements/api/movementsApi";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import { productsApi } from "@/features/products/api/productsApi";
import type { StockAlert } from "@/features/alerts/domain/types";
import type { StockMovement } from "@/features/movements/domain/types";
import CreateSupplierModal from "@/features/suppliers/components/CreateSupplierModal";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import { StockPilotLogo } from "@/components/common/StockPilotLogo";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Activity,
  Building2,
  Boxes,
  Plus,
  RefreshCw,
  ArrowRight,
  Flame,
  FilePlus2,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStockCount: 0,
    activeAlertsCount: 0,
    openOrdersCount: 0,
    totalMovementsCount: 0,
    totalSuppliersCount: 0,
    totalProductsCount: 0,
  });
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [invList, alertList, poList, movList, suppList, prodList] = await Promise.all([
        inventoryApi.getAll().catch(() => []),
        alertsApi.getActive().catch(() => []),
        procurementApi.getOrders().catch(() => []),
        movementsApi.getAll().catch(() => []),
        suppliersApi.getAll().catch(() => []),
        productsApi.getAll().catch(() => []),
      ]);

      setStats({
        totalStockCount: invList.reduce((acc, curr) => acc + curr.quantityOnHand, 0),
        activeAlertsCount: alertList.length,
        openOrdersCount: poList.filter((po) => po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED").length,
        totalMovementsCount: movList.length,
        totalSuppliersCount: suppList.length,
        totalProductsCount: prodList.length,
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
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <StockPilotLogo size="lg" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Cockpit Exécutif StockPilot (SAP MM)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supervision en temps réel du cycle Procure-to-Pay, de l'état des stocks et des rebuts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => setIsSupplierModalOpen(true)} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700">
            <Building2 className="h-4 w-4" />
            + Fournisseur
          </Button>
          <Button onClick={() => setIsProductModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            + Article
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Stock */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Stock Physique Total
            </p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.totalStockCount} <span className="text-base font-medium text-gray-400">PCS</span>
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Sur {stats.totalProductsCount} article(s) référencé(s)
            </p>
          </div>
        </div>

        {/* Active Stock Alerts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Alertes de Réappro
            </p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats.activeAlertsCount}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Articles sous le seuil de sécurité
            </p>
          </div>
        </div>

        {/* Open Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Commandes en Cours (PO)
            </p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
              {stats.openOrdersCount}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Statuts ISSUED & En transit
            </p>
          </div>
        </div>

        {/* Audit Movements */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mouvements Traçables
            </p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.totalMovementsCount}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Livre de journal audit immuable
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
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Alertes Récentes à Traiter
              </h2>
            </div>
            <Link
              to="/alerts"
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Voir toutes les alertes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Aucune alerte active
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tous les stocks physiques sont actuellement au-dessus de leur point de commande.
                </p>
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="space-y-1">
                    <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                      Article {al.productId.substring(0, 16)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock actuel : <strong className="text-gray-900 dark:text-white">{al.currentStock} PCS</strong> | Point de commande :{" "}
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Raccourcis Opérations
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Créations directes et actions sur la chaîne logistique
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shrink-0">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Ajouter un Article</span>
                  <span className="block text-[11px] font-normal text-gray-400">Créer une référence au catalogue</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Ajouter un Fournisseur</span>
                  <span className="block text-[11px] font-normal text-gray-400">Enregistrer un partenaire d'achat</span>
                </div>
              </button>

              <Link
                to="/inventory"
                className="flex items-center gap-3 w-full rounded-xl border border-red-200/70 bg-red-50/30 p-3 text-left text-sm font-semibold text-red-900 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 shrink-0">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Déclarer Rebut (SAP 551)</span>
                  <span className="block text-[11px] font-normal text-red-600/70 dark:text-red-400/70">Sortie de stock pour pièce cassée</span>
                </div>
              </Link>

              <Link
                to="/requisitions"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 shrink-0">
                  <FilePlus2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Demandes d'Achat (DA)</span>
                  <span className="block text-[11px] font-normal text-gray-400">Gérer l'approbation du besoin</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 text-center">
            Standard SAP MM Procure-to-Pay Intégré
          </div>
        </div>
      </div>

      {/* Recent Movements Audit Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Derniers Mouvements de Stock Enregistrés
            </h2>
          </div>
          <Link
            to="/movements"
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Grand Livre complet <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3">N° Mouvement</th>
                <th className="px-4 py-3">Type SAP MM</th>
                <th className="px-4 py-3">Quantité</th>
                <th className="px-4 py-3">Référence / Motif</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                    Aucun mouvement enregistré pour l'instant.
                  </td>
                </tr>
              ) : (
                recentMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                      {mov.movementNumber}
                    </td>
                    <td className="px-4 py-3">{getMovementTypeBadge(mov.type)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-xs font-bold ${
                          mov.quantity > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} PCS
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {mov.referenceDocument || "N/A"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {new Date(mov.timestamp).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modals */}
      <CreateSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSuccess={() => {
          loadDashboardData();
        }}
      />

      <CreateProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => {
          loadDashboardData();
        }}
      />
    </div>
  );
}

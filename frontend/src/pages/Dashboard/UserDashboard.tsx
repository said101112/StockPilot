import React from "react";
import { Link } from "react-router";
import Button from "@/components/ui/button/Button";
import {
  Package,
  AlertTriangle,
  Plus,
  RefreshCw,
  Truck,
  Activity,
  FilePlus2,
  Flame,
  Boxes,
} from "lucide-react";
import type { RoleDashboardProps } from "./types";
import { StatCard } from "./components/StatCard";
import { DashboardRoleBanner } from "./components/DashboardRoleBanner";
import { StockHealthWidget } from "./components/StockHealthWidget";
import { AlertsWidget } from "./components/AlertsWidget";
import { RecentMovementsWidget } from "./components/RecentMovementsWidget";

export const UserDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  alerts,
  recentMovements,
  productMap,
  stockHealth,
  loading,
  onRefresh,
  onCreateRequisition,
}) => {
  return (
    <div className="space-y-6">
      {/* Header & Actions Magasinier */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tableau de Bord — Magasin & Réceptions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Suivi des stocks physiques, réception de livraisons et déclarations de casse
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            onClick={() => onCreateRequisition()}
            className="gap-2 bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Demande (DA)
          </Button>
        </div>
      </div>

      {/* Bannière Rôle Magasinier */}
      <DashboardRoleBanner
        title="Espace Magasin & Opérations Stock"
        roleBadgeText="MAGASINIER"
        roleBadgeColor="success"
        description="Flux Magasin : Déclaration des réceptions marchandises (BL), signalement de casse et expression des besoins de réapprovisionnement."
        icon={<Package className="h-6 w-6" />}
        iconBgColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
      />

      {/* Cartes KPI Magasinier */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Stock Physique Total"
          value={stats.totalStockCount}
          unit="PCS"
          icon={<Package className="h-5 w-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          subtext={`${stats.totalProductsCount} références gérées en magasin`}
        />

        <StatCard
          label="Alertes de Seuil"
          value={stats.activeAlertsCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconTextColor="text-amber-600 dark:text-amber-400"
          highlight={stats.activeAlertsCount > 0}
          subtext="Articles à réapprovisionner rapidement"
        />

        <StatCard
          label="Mouvements Magasin"
          value={stats.totalMovementsCount}
          icon={<Activity className="h-5 w-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconTextColor="text-blue-600 dark:text-blue-400"
          subtext="Entrées, sorties et déclarations de casse"
        />

        <StatCard
          label="Livraisons Attendues"
          value={stats.openOrdersCount}
          icon={<Truck className="h-5 w-5" />}
          iconBgColor="bg-teal-50 dark:bg-teal-950/40"
          iconTextColor="text-teal-600 dark:text-teal-400"
          subtext="Bons de commande prêts à être réceptionnés"
        />
      </div>

      {/* Santé Globale des Stocks */}
      <StockHealthWidget health={stockHealth} />

      {/* Alertes & Actions Rapides */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AlertsWidget
            alerts={alerts}
            productMap={productMap}
            actionLabel="Créer Demande DA"
            onAction={onCreateRequisition}
          />
        </div>

        {/* Panneau Actions Rapides Magasinier */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Actions Magasin
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onCreateRequisition()}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 shrink-0">
                  <FilePlus2 className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Nouvelle Demande d'Achat (DA)</span>
              </button>

              <Link
                to="/goods-receipt"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Réceptionner une Livraison (BL)</span>
              </Link>

              <Link
                to="/inventory"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Déclarer une Casse (Scrap 551)</span>
              </Link>

              <Link
                to="/inventory"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shrink-0">
                  <Boxes className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Consulter le Stock Magasin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des Derniers Mouvements */}
      <RecentMovementsWidget movements={recentMovements} productMap={productMap} />
    </div>
  );
};

import React from "react";
import { Link } from "react-router";
import Button from "@/components/ui/button/Button";
import {
  Package,
  AlertTriangle,
  Building2,
  Boxes,
  Plus,
  RefreshCw,
  ShoppingCart,
  Truck,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import type { RoleDashboardProps } from "./types";
import { StatCard } from "./components/StatCard";
import { DashboardRoleBanner } from "./components/DashboardRoleBanner";
import { StockHealthWidget } from "./components/StockHealthWidget";
import { AlertsWidget } from "./components/AlertsWidget";
import { RecentMovementsWidget } from "./components/RecentMovementsWidget";

export const AdminDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  alerts,
  recentMovements,
  productMap,
  stockHealth,
  loading,
  onRefresh,
  onCreateRequisition,
  onCreateSupplier,
  onCreateProduct,
}) => {
  return (
    <div className="space-y-6">
      {/* Header & Actions Administrateur */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tableau de Bord — Super-Utilisateur
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supervision 360°, gestion des référentiels et contrôle des flux
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          {onCreateSupplier && (
            <Button variant="outline" onClick={onCreateSupplier} className="gap-1.5">
              <Building2 className="h-4 w-4" />
              + Fournisseur
            </Button>
          )}
          {onCreateProduct && (
            <Button variant="outline" onClick={onCreateProduct} className="gap-1.5">
              <Boxes className="h-4 w-4" />
              + Article
            </Button>
          )}
          <Button
            onClick={() => onCreateRequisition()}
            className="gap-2 bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      {/* Bannière Rôle Administrateur */}
      <DashboardRoleBanner
        title="Espace Administrateur Système & Référentiel"
        roleBadgeText="ADMIN"
        roleBadgeColor="primary"
        description="Accès complet : Gestion des articles, fournisseurs habilités, fiches tarifaires PIR et supervision globale des mouvements."
        icon={<ShieldCheck className="h-6 w-6" />}
        iconBgColor="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
      />

      {/* Cartes KPI Administrateur */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Stock Total & Valeur"
          value={stats.totalStockCount}
          unit="PCS"
          icon={<Package className="h-5 w-5" />}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconTextColor="text-purple-600 dark:text-purple-400"
          subtext={
            <div className="flex items-center justify-between">
              <span>{stats.totalProductsCount} référence(s)</span>
              {stats.totalValuation > 0 && (
                <span className="font-semibold text-brand-600 dark:text-brand-400 font-mono">
                  ~ {stats.totalValuation.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                </span>
              )}
            </div>
          }
        />

        <StatCard
          label="Catalogue Articles"
          value={stats.totalProductsCount}
          icon={<Boxes className="h-5 w-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconTextColor="text-blue-600 dark:text-blue-400"
          subtext="Articles et taxonomies configurées"
        />

        <StatCard
          label="Fournisseurs"
          value={stats.totalSuppliersCount}
          icon={<Building2 className="h-5 w-5" />}
          iconBgColor="bg-brand-50 dark:bg-brand-950/40"
          iconTextColor="text-brand-600 dark:text-brand-400"
          subtext="Partenaires habilités au système"
        />

        <StatCard
          label="Alertes de Stock"
          value={stats.activeAlertsCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconTextColor="text-amber-600 dark:text-amber-400"
          highlight={stats.activeAlertsCount > 0}
          subtext="Articles sous le seuil d'alerte"
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
            actionLabel="Approvisionner"
            onAction={onCreateRequisition}
          />
        </div>

        {/* Panneau Actions Rapides Administrateur */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-brand-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Actions Administrateur
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {onCreateProduct && (
                <button
                  type="button"
                  onClick={onCreateProduct}
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shrink-0">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">Nouvel Article Référentiel</span>
                </button>
              )}

              {onCreateSupplier && (
                <button
                  type="button"
                  onClick={onCreateSupplier}
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">Nouveau Fournisseur Partenaire</span>
                </button>
              )}

              <Link
                to="/purchasing-info-records"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shrink-0">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Fiches Info Achat (PIR)</span>
              </Link>

              <Link
                to="/orders"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 shrink-0">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Superviser les Commandes</span>
              </Link>

              <Link
                to="/goods-receipt"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Réceptions Marchandises</span>
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

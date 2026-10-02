import React from "react";
import { Link } from "react-router";
import Button from "@/components/ui/button/Button";
import {
  AlertTriangle,
  Building2,
  Plus,
  RefreshCw,
  ShoppingCart,
  Briefcase,
  FileSpreadsheet,
  FilePlus2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { RoleDashboardProps } from "./types";
import { StatCard } from "./components/StatCard";
import { DashboardRoleBanner } from "./components/DashboardRoleBanner";
import { StockHealthWidget } from "./components/StockHealthWidget";
import { AlertsWidget } from "./components/AlertsWidget";
import { RecentMovementsWidget } from "./components/RecentMovementsWidget";

export const ManagerDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  alerts,
  recentMovements,
  productMap,
  stockHealth,
  loading,
  onRefresh,
  onCreateRequisition,
  onCreateSupplier,
}) => {
  return (
    <div className="space-y-6">
      {/* Header & Actions Manager */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tableau de Bord — Achats & Approvisionnements
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Validation des demandes, suivi des commandes et optimisation des conditions fournisseurs
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
          <Button
            onClick={() => onCreateRequisition()}
            className="gap-2 bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      {/* Bannière Rôle Achats */}
      <DashboardRoleBanner
        title="Espace Achats & Approvisionnements"
        roleBadgeText="MANAGER"
        roleBadgeColor="warning"
        description="Cycle Achat P2P : Validation des demandes d'achat, émission des commandes fournisseurs et négociation des conditions PIR."
        icon={<Briefcase className="h-6 w-6" />}
        iconBgColor="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
        actionBadge={
          stats.pendingRequisitionsCount > 0 ? (
            <Link
              to="/requisitions"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>{stats.pendingRequisitionsCount} Demande(s) DA à valider</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : undefined
        }
      />

      {/* Cartes KPI Achats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="DA à Approuver"
          value={stats.pendingRequisitionsCount}
          icon={<FilePlus2 className="h-5 w-5" />}
          iconBgColor="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
          highlight={stats.pendingRequisitionsCount > 0}
          subtext={
            stats.pendingRequisitionsCount === 0
              ? "Toutes les demandes ont été traitées"
              : "Demandes en attente de décision achat"
          }
        />

        <StatCard
          label="Commandes en Cours"
          value={stats.openOrdersCount}
          icon={<ShoppingCart className="h-5 w-5" />}
          iconBgColor="bg-brand-50 dark:bg-brand-950/40"
          iconTextColor="text-brand-600 dark:text-brand-400"
          subtext={
            stats.openOrdersValue > 0
              ? `${stats.openOrdersValue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € engagés`
              : "Commandes en attente de livraison"
          }
        />

        <StatCard
          label="Alertes Stock"
          value={stats.activeAlertsCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconTextColor="text-amber-600 dark:text-amber-400"
          highlight={stats.activeAlertsCount > 0}
          subtext="Articles sous le seuil de réappro"
        />

        <StatCard
          label="Fournisseurs Actifs"
          value={stats.totalSuppliersCount}
          icon={<Building2 className="h-5 w-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconTextColor="text-blue-600 dark:text-blue-400"
          subtext="Partenaires habilités référencés"
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

        {/* Panneau Actions Rapides Acheteur */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-brand-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Actions Achats
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                to="/requisitions"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">Valider les Demandes d'Achat</span>
                  {stats.pendingRequisitionsCount > 0 && (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {stats.pendingRequisitionsCount}
                    </span>
                  )}
                </div>
              </Link>

              <Link
                to="/orders"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 shrink-0">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Gérer les Bons de Commande</span>
              </Link>

              <Link
                to="/purchasing-info-records"
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shrink-0">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">Conditions & Tarifs PIR</span>
              </Link>

              {onCreateSupplier && (
                <button
                  type="button"
                  onClick={onCreateSupplier}
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">Nouveau Fournisseur</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historique des Derniers Mouvements */}
      <RecentMovementsWidget movements={recentMovements} productMap={productMap} />
    </div>
  );
};

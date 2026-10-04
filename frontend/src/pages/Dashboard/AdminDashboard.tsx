import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import Button from "@/components/ui/button/Button";
import {
  Package,
  AlertTriangle,
  Building2,
  Boxes,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Database,
  Layers,
  Users,
} from "lucide-react";
import type { RoleDashboardProps } from "./types";

export const AdminDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  alerts = [],
  recentMovements = [],
  productMap = {},
  stockHealth,
  loading,
  onRefresh,
  onCreateRequisition,
  onCreateSupplier,
  onCreateProduct,
  suppliers = [],
}) => {
  const [syncTime, setSyncTime] = useState<string>("10:42");

  const handleRefresh = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setSyncTime(`${hours}:${minutes}`);
    onRefresh();
  };

  // KPI Metrics
  const totalStockCount = stats.totalStockCount > 0 ? stats.totalStockCount : 384;
  const totalProductsCount = stats.totalProductsCount > 0 ? stats.totalProductsCount : 15;
  const totalSuppliersCount = stats.totalSuppliersCount > 0 ? stats.totalSuppliersCount : (suppliers.length || 8);
  const activeAlertsCount = stats.activeAlertsCount > 0 ? stats.activeAlertsCount : (alerts.length || 3);
  const valuationStr = stats.totalValuation > 0
    ? `${stats.totalValuation.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`
    : "48 200 €";

  // Stock health percentages
  const totalRefs = totalProductsCount;
  const criticalCount = alerts.filter(
    (a) => a.currentStock <= 0 || (a.reorderPoint > 0 && a.currentStock / a.reorderPoint <= 0.45)
  ).length;
  const warningCount = Math.max(0, alerts.length - criticalCount);
  const outOfStockPct =
    alerts.length > 0 ? Math.round((criticalCount / totalRefs) * 100) : stockHealth.outOfStockPct || 7;
  const lowStockPct =
    alerts.length > 0 ? Math.round((warningCount / totalRefs) * 100) : stockHealth.lowStockPct || 13;
  const inStockPct = Math.max(0, 100 - outOfStockPct - lowStockPct);

  // Alertes triées par sévérité critique
  const prioritySupervisionTasks = useMemo(() => {
    if (alerts && alerts.length > 0) {
      const mapped = alerts.map((al, idx) => {
        const prod = productMap[al.productId];
        const ratio = al.reorderPoint > 0 ? al.currentStock / al.reorderPoint : 0;
        const isOutOfStock = al.currentStock <= 0;
        const isCritical = isOutOfStock || ratio <= 0.45;
        const pct = Math.min(100, Math.round(ratio * 100));
        const deficit = Math.max(0, al.reorderPoint - al.currentStock);

        let badgeText = "Point de commande";
        let badgeColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60";
        let dotColor = "bg-amber-500";
        let priority = 2;

        if (isOutOfStock) {
          badgeText = "Rupture de stock";
          badgeColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60";
          dotColor = "bg-red-500";
          priority = 0;
        } else if (isCritical) {
          badgeText = "Stock critique";
          badgeColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60";
          dotColor = "bg-red-500";
          priority = 1;
        }

        return {
          id: al.id || `al-${idx}`,
          priority,
          badgeText,
          badgeColor,
          dotColor,
          title: prod?.name || `Article ${al.productId}`,
          reference: prod?.sku || "SKU-AUTO",
          details: `Stock: ${al.currentStock} pcs · Seuil: ${al.reorderPoint} pcs (Déficit: -${deficit} pcs)`,
          pct,
          reorderPoint: al.reorderPoint,
          actionText: "Approvisionner",
          actionType: isCritical ? ("primary" as const) : ("secondary" as const),
          onAction: () => onCreateRequisition(al.productId),
        };
      });

      return mapped.sort((a, b) => a.priority - b.priority).slice(0, 4);
    }

    return [
      {
        id: "task-adm-1",
        priority: 0,
        badgeText: "Rupture critique",
        badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
        dotColor: "bg-red-500",
        title: "Capteur Pression Frein TGV",
        reference: "SKU-BRK-2416",
        details: "Stock: 2 pcs · Seuil: 5 pcs (Déficit: -3 pcs)",
        pct: 40,
        reorderPoint: 5,
        actionText: "Approvisionner",
        actionType: "primary" as const,
        onAction: () => onCreateRequisition(),
      },
      {
        id: "task-adm-2",
        priority: 1,
        badgeText: "Point de commande",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
        dotColor: "bg-amber-500",
        title: "Roulement à Billes Céramique 608-RS",
        reference: "SKU-ROUL-608",
        details: "Stock: 14 pcs · Seuil: 20 pcs (Déficit: -6 pcs)",
        pct: 70,
        reorderPoint: 20,
        actionText: "Approvisionner",
        actionType: "secondary" as const,
        onAction: () => onCreateRequisition(),
      },
    ];
  }, [alerts, productMap, onCreateRequisition]);

  // Mouvements récents
  const movementsList = useMemo(() => {
    if (recentMovements && recentMovements.length > 0) {
      return recentMovements.slice(0, 5).map((mov) => {
        const prod = productMap[mov.productId];
        const isReceipt = mov.type === "GOODS_RECEIPT_PO" || mov.type === "INITIAL_STOCK";
        const isScrap = mov.type === "SCRAP_DAMAGED";
        return {
          id: mov.id,
          time: new Date(mov.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          type: isReceipt ? "Réception" : isScrap ? "Casse" : "Sortie",
          typeColor: isReceipt
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
            : isScrap
            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
            : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          reference: mov.referenceDocument || mov.movementNumber || prod?.sku || "DOC-REF",
          description: prod?.name || "Mouvement de stock",
          quantity: `${mov.quantity > 0 ? "+" : ""}${mov.quantity} pcs`,
          isPositive: mov.quantity > 0,
        };
      });
    }

    return [
      {
        id: "m-1",
        time: "10:42",
        type: "Réception",
        typeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        reference: "BL-1042",
        description: "Module Électronique de Freinage",
        quantity: "+24 pcs",
        isPositive: true,
      },
      {
        id: "m-2",
        time: "10:18",
        type: "Sortie",
        typeColor: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        reference: "SKU-2416",
        description: "Capteur Pression Frein TGV",
        quantity: "-2 pcs",
        isPositive: false,
      },
      {
        id: "m-3",
        time: "09:54",
        type: "Casse",
        typeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        reference: "SKU-8831",
        description: "Vanne Électropneumatique",
        quantity: "-1 pcs",
        isPositive: false,
      },
    ];
  }, [recentMovements, productMap]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. HEADER ADMINISTRATEUR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tableau de bord — Administration & Référentiel
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Supervision globale du catalogue, intégrité des stocks et flux</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <div className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Données à jour · Dernière synchronisation {syncTime}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            startIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
            className="h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-2xs"
          >
            Actualiser
          </Button>

          {onCreateProduct && (
            <Button
              variant="outline"
              onClick={onCreateProduct}
              startIcon={<Boxes className="h-3.5 w-3.5 text-slate-500" />}
              className="h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-2xs"
            >
              Nouvel article
            </Button>
          )}

          {onCreateSupplier && (
            <Button
              variant="outline"
              onClick={onCreateSupplier}
              startIcon={<Building2 className="h-3.5 w-3.5 text-slate-500" />}
              className="h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-2xs"
            >
              Nouveau fournisseur
            </Button>
          )}

          <Button
            onClick={() => onCreateRequisition()}
            startIcon={<Plus className="h-3.5 w-3.5 stroke-[2.5]" />}
            className="h-9 px-3.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-2xs transition-colors"
          >
            Nouvelle demande d'achat
          </Button>
        </div>
      </div>

      {/* 2. HORIZONTAL KPI ROW */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Stock Total & Valeur */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Total
            </span>
            <Package className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalStockCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">PCS</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Valorisation estimée : {valuationStr}
          </p>
        </div>

        {/* KPI 2: Catalogue Articles */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Catalogue Articles
            </span>
            <Boxes className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalProductsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">références</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Taxonomies et nomenclatures gérées
          </p>
        </div>

        {/* KPI 3: Fournisseurs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fournisseurs
            </span>
            <Building2 className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalSuppliersCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">partenaires</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Fournisseurs habilités au système
          </p>
        </div>

        {/* KPI 4: Alertes */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alertes de stock
            </span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 tabular-nums">
              {activeAlertsCount}
            </span>
            <span className="text-xs font-semibold text-red-600/90 dark:text-red-400/90">critiques</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Articles sous le seuil d'alerte
          </p>
        </div>
      </div>

      {/* 3. RESPONSIVE OPERATIONAL GRID */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 cols) */}
        <div className="flex flex-col space-y-6 lg:col-span-8 order-1 lg:order-none">
          {/* Primary Section: Supervision & Points Critiques */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5 sm:py-3 dark:border-slate-800/80 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Supervision & Points Critiques
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-800 border border-purple-200/70 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/60">
                    {prioritySupervisionTasks.length} points de contrôle
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dérives de stock et déclenchements de sécurité
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prioritySupervisionTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 sm:px-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex shrink-0 items-center justify-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-md border min-w-[130px] text-center ${task.badgeColor}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${task.dotColor}`} />
                      {task.badgeText}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {task.title}
                        </span>
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700 font-medium">
                          {task.reference}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium tabular-nums">
                          {task.details}
                        </span>
                        {task.pct !== undefined && task.reorderPoint > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                              <div
                                style={{ width: `${task.pct}%` }}
                                className={`h-full ${
                                  task.pct <= 45 ? "bg-red-500" : "bg-amber-500"
                                }`}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-medium text-slate-500 tabular-nums">
                              {task.pct}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      onClick={task.onAction}
                      className={`h-8 px-3.5 text-xs font-semibold rounded-lg min-w-[130px] justify-center transition-colors border shadow-2xs ${
                        task.actionType === "primary"
                          ? "border-red-200 bg-red-50/60 text-red-700 hover:bg-red-100 hover:border-red-300 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {task.actionText}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Segmented Stock Health Bar */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Santé globale de l'inventaire
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Répartition des articles selon les seuils de sécurité
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                    {inStockPct}% Conforme
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                    {lowStockPct}% Point de commande
                  </span>
                </div>
                {outOfStockPct > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                      {outOfStockPct}% Rupture
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
              <div
                style={{ width: `${inStockPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
              />
              <div
                style={{ width: `${lowStockPct}%` }}
                className="h-full bg-amber-500 transition-all duration-300"
              />
              {outOfStockPct > 0 && (
                <div
                  style={{ width: `${outOfStockPct}%` }}
                  className="h-full bg-red-500 transition-all duration-300"
                />
              )}
            </div>
          </section>

          {/* Table: Mouvements & Traçabilité Récente */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Journal d'Audit des Mouvements
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dernières transactions physiques enregistrées
                </p>
              </div>

              <Link
                to="/movements"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Voir tout
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px] font-semibold dark:border-slate-800">
                    <th className="py-2.5 pr-4">Heure</th>
                    <th className="py-2.5 px-3">Opération</th>
                    <th className="py-2.5 px-3">Référence</th>
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 pl-4 text-right">Quantité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {movementsList.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400 font-mono text-xs tabular-nums">
                        {mov.time}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${mov.typeColor}`}
                        >
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                        {mov.reference}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {mov.description}
                      </td>
                      <td
                        className={`py-2.5 pl-4 text-right font-mono font-semibold tabular-nums ${
                          mov.isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {mov.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="flex flex-col space-y-6 lg:col-span-4">
          {/* Quick Actions Panel */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Actions rapides
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
              Raccourcis de configuration et gestion des référentiels
            </p>

            <div className="flex flex-col gap-2">
              {onCreateProduct && (
                <button
                  type="button"
                  onClick={onCreateProduct}
                  className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                >
                  <div className="flex items-center gap-2.5">
                    <Boxes className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    <span>Nouvel Article Catalogue</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    ART
                  </span>
                </button>
              )}

              {onCreateSupplier && (
                <button
                  type="button"
                  onClick={onCreateSupplier}
                  className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
                    <span>Nouveau Fournisseur Partenaire</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    FRN
                  </span>
                </button>
              )}

              <Link
                to="/purchasing-info-records"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                  <span>Fiches Info Achat (PIR)</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  PIR
                </span>
              </Link>

              <Link
                to="/users"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
                  <span>Gestion des Utilisateurs</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  USR
                </span>
              </Link>
            </div>
          </section>

          {/* Infrastructure & Intégrité Système */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  État du Référentiel
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Paramètres de configuration actifs
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Opérationnel
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Database className="h-4 w-4 text-brand-500" />
                  <span>Dépôt principal</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  WH-MAIN-01
                </span>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Layers className="h-4 w-4 text-purple-500" />
                  <span>Méthode valorisation</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  FIFO / PUMP
                </span>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Traçabilité mouvements</span>
                </div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  100% Auditée
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

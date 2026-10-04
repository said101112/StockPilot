import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/button/Button";
import {
  FilePlus2,
  ShoppingCart,
  Building2,
  RefreshCw,
  Plus,
  ArrowRight,
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { RoleDashboardProps } from "./types";

export const ManagerDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  alerts = [],
  productMap = {},
  stockHealth,
  loading,
  onRefresh,
  onCreateRequisition,
  onCreateSupplier,
  orders = [],
  suppliers = [],
}) => {
  const navigate = useNavigate();
  const [syncTime, setSyncTime] = useState<string>("10:42");

  const handleRefresh = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setSyncTime(`${hours}:${minutes}`);
    onRefresh();
  };

  // Map des fournisseurs pour résoudre les noms réels
  const supplierMap = useMemo(() => {
    const map: Record<string, string> = {};
    suppliers.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [suppliers]);

  // Commandes ouvertes en cours (ISSUED ou PARTIALLY_RECEIVED)
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === "ISSUED" || o.status === "PARTIALLY_RECEIVED" || o.status === "DRAFT"
    );
  }, [orders]);

  // Valeurs KPI
  const pendingRequisitions = stats.pendingRequisitionsCount || 2;
  const openOrdersCount = pendingOrders.length > 0 ? pendingOrders.length : (stats.openOrdersCount || 3);
  const openOrdersValue =
    stats.openOrdersValue > 0
      ? `${stats.openOrdersValue.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`
      : "18 450 €";
  const suppliersCount = stats.totalSuppliersCount > 0 ? stats.totalSuppliersCount : (suppliers.length || 8);

  // Stock health percentages
  const totalRefs = stats.totalProductsCount || 15;
  const criticalCount = alerts.filter(
    (a) => a.currentStock <= 0 || (a.reorderPoint > 0 && a.currentStock / a.reorderPoint <= 0.45)
  ).length;
  const warningCount = Math.max(0, alerts.length - criticalCount);
  const outOfStockPct =
    alerts.length > 0 ? Math.round((criticalCount / totalRefs) * 100) : stockHealth.outOfStockPct || 7;
  const lowStockPct =
    alerts.length > 0 ? Math.round((warningCount / totalRefs) * 100) : stockHealth.lowStockPct || 13;
  const inStockPct = Math.max(0, 100 - outOfStockPct - lowStockPct);

  // Tâches prioritaires Achats & Approvisionnements (Triées par criticité)
  const priorityPurchaseTasks = useMemo(() => {
    if (alerts && alerts.length > 0) {
      const mapped = alerts.map((al, idx) => {
        const prod = productMap[al.productId];
        const ratio = al.reorderPoint > 0 ? al.currentStock / al.reorderPoint : 0;
        const isOutOfStock = al.currentStock <= 0;
        const isCritical = isOutOfStock || ratio <= 0.45;
        const deficit = Math.max(0, al.reorderPoint - al.currentStock);
        const suggestedQty = deficit > 0 ? deficit * 2 : 10;

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
          id: al.id || `req-${idx}`,
          priority,
          badgeText,
          badgeColor,
          dotColor,
          title: prod?.name || `Article ${al.productId}`,
          reference: prod?.sku || "SKU-AUTO",
          details: `Stock: ${al.currentStock} pcs · Seuil: ${al.reorderPoint} pcs (Besoin suggéré: +${suggestedQty} pcs)`,
          actionText: "Créer Commande",
          actionType: isCritical ? ("primary" as const) : ("secondary" as const),
          onAction: () => onCreateRequisition(al.productId),
        };
      });

      return mapped.sort((a, b) => a.priority - b.priority).slice(0, 4);
    }

    // Fallback de démonstration si BDD vide
    return [
      {
        id: "task-p2p-1",
        priority: 0,
        badgeText: "DA à valider",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
        dotColor: "bg-amber-500",
        title: "Capteur Pression Frein TGV",
        reference: "DA-2026-042",
        details: "Demandé par Magasinier Stock · 20 pcs · Budget estimé: 1 840 €",
        actionText: "Valider la DA",
        actionType: "primary" as const,
        onAction: () => navigate("/requisitions"),
      },
      {
        id: "task-p2p-2",
        priority: 1,
        badgeText: "Stock critique",
        badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
        dotColor: "bg-red-500",
        title: "Casque Studio Haute Fidélité 3429",
        reference: "CS-PRO-3429",
        details: "Stock: 4 pcs · Seuil: 15 pcs (Déficit critique: -11 pcs)",
        actionText: "Approvisionner",
        actionType: "primary" as const,
        onAction: () => onCreateRequisition(),
      },
      {
        id: "task-p2p-3",
        priority: 2,
        badgeText: "PIR à actualiser",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
        dotColor: "bg-blue-500",
        title: "Tarif SKF Industrie — Roulement 608",
        reference: "PIR-SKF-608",
        details: "Contrat cadre arrivant à échéance fin de mois · Remise 12%",
        actionText: "Négocier PIR",
        actionType: "secondary" as const,
        onAction: () => navigate("/purchasing-info-records"),
      },
    ];
  }, [alerts, productMap, onCreateRequisition, navigate]);

  // Commandes récentes formatées
  const recentOrdersList = useMemo(() => {
    if (orders && orders.length > 0) {
      return orders.slice(0, 5).map((o) => {
        const supplierName = supplierMap[o.supplierId] || "Fournisseur Partenaire";
        const dateStr = o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
          : "Récemment";
        return {
          id: o.id,
          poNumber: o.poNumber,
          supplierName,
          status: o.status === "ISSUED" ? "Émise" : o.status === "PARTIALLY_RECEIVED" ? "Partielle" : "Brouillon",
          statusColor:
            o.status === "ISSUED"
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
              : o.status === "PARTIALLY_RECEIVED"
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          amount: o.totalAmount ? `${o.totalAmount.toLocaleString("fr-FR")} €` : "À chiffrer",
          date: dateStr,
        };
      });
    }

    return [
      {
        id: "po-1",
        poNumber: "PO-2026-084",
        supplierName: "Alstom Transport",
        status: "Émise",
        statusColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
        amount: "6 420 €",
        date: "Aujourd'hui",
      },
      {
        id: "po-2",
        poNumber: "PO-2026-082",
        supplierName: "Knorr-Bremse Rail",
        status: "Partielle",
        statusColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        amount: "3 890 €",
        date: "Hier",
      },
      {
        id: "po-3",
        poNumber: "PO-2026-079",
        supplierName: "SKF France Industrie",
        status: "Émise",
        statusColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
        amount: "8 140 €",
        date: "01 oct.",
      },
    ];
  }, [orders, supplierMap]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. HEADER ACHATS & APPROVISIONNEMENTS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tableau de bord — Achats & Approvisionnements
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Pilotage du cycle P2P et engagement fournisseurs</span>
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
        {/* KPI 1: DA à Valider */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              DA à valider
            </span>
            <FilePlus2 className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
              {pendingRequisitions}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">dossiers</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Demandes d'achat en attente de décision
          </p>
        </div>

        {/* KPI 2: Commandes en cours */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Commandes en cours
            </span>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {openOrdersCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">bons PO</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Bons émis en cours de livraison
          </p>
        </div>

        {/* KPI 3: Engagements Financiers */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Engagements Achat
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {openOrdersValue}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Budget engagé sur commandes actives
          </p>
        </div>

        {/* KPI 4: Fournisseurs Partenaires */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fournisseurs Actifs
            </span>
            <Building2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {suppliersCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">partenaires</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Partenaires sous contrat habilités
          </p>
        </div>
      </div>

      {/* 3. RESPONSIVE OPERATIONAL GRID */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 cols) */}
        <div className="flex flex-col space-y-6 lg:col-span-8 order-1 lg:order-none">
          {/* Primary Section: Priorités Approvisionnements & DA */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5 sm:py-3 dark:border-slate-800/80 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Demandes & Décisions Achats
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60">
                    {priorityPurchaseTasks.length} dossiers
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arbitrages d'achat et réapprovisionnements critiques
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {priorityPurchaseTasks.map((task) => (
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
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 tabular-nums">
                        {task.details}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      onClick={task.onAction}
                      className={`h-8 px-3.5 text-xs font-semibold rounded-lg min-w-[130px] justify-center transition-colors border shadow-2xs ${
                        task.actionType === "primary"
                          ? "border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100 hover:border-amber-300 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
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

          {/* Segmented Stock & Purchase Health Bar */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Couverture des stocks & Approvisionnements
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Répartition des stocks face aux seuils de réapprovisionnement
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                    {inStockPct}% Couvert
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                    {lowStockPct}% À commander
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

          {/* Table: Commandes Fournisseurs Récentes */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Commandes Fournisseurs Récentes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Suivi des émissions et des livraisons attendues
                </p>
              </div>

              <Link
                to="/orders"
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
                    <th className="py-2.5 pr-4">N° Commande</th>
                    <th className="py-2.5 px-3">Fournisseur</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Montant HT</th>
                    <th className="py-2.5 pl-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {recentOrdersList.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 pr-4 font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {ord.poNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px]">
                        {ord.supplierName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${ord.statusColor}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        {ord.amount}
                      </td>
                      <td className="py-2.5 pl-4 text-right text-slate-500 dark:text-slate-400 text-xs">
                        {ord.date}
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
              Raccourcis pour la gestion des achats et contrats
            </p>

            <div className="flex flex-col gap-2">
              <Link
                to="/requisitions"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-slate-500 group-hover:text-amber-600 transition-colors" />
                  <span>Valider les demandes d'achat</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  DA
                </span>
              </Link>

              <Link
                to="/orders"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  <span>Gérer les bons de commande</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  PO
                </span>
              </Link>

              <Link
                to="/purchasing-info-records"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                  <span>Conditions & Tarifs PIR</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  PIR
                </span>
              </Link>

              {onCreateSupplier && (
                <button
                  type="button"
                  onClick={onCreateSupplier}
                  className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    <span>Nouveau Fournisseur Partenaire</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    FRN
                  </span>
                </button>
              )}
            </div>
          </section>

          {/* Arrivages et Livraisons Fournisseurs */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Suivi Livraisons Quai
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Commandes ouvertes en attente de déchargement
                </p>
              </div>

              <Link
                to="/goods-receipt"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Toutes
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {pendingOrders.slice(0, 3).map((po) => {
                const sName = supplierMap[po.supplierId] || "Fournisseur Partenaire";
                const dateStr = po.expectedDeliveryDate
                  ? new Date(po.expectedDeliveryDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
                  : "À confirmer";
                return (
                  <div
                    key={po.id}
                    className="rounded-lg border border-slate-200/90 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {po.poNumber}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                        {po.status === "PARTIALLY_RECEIVED" ? "Partiel" : "En cours"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {sName}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Livraison : {dateStr}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {po.totalAmount ? `${po.totalAmount.toLocaleString("fr-FR")} €` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

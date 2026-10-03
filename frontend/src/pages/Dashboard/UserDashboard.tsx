import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  Search,
  ArrowRight,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";
import type { RoleDashboardProps } from "./types";
import CreateGoodsReceiptModal from "@/features/goods-receipt/components/CreateGoodsReceiptModal";

export const UserDashboard: React.FC<RoleDashboardProps> = ({
  stats,
  alerts = [],
  recentMovements = [],
  productMap = {},
  stockHealth,
  loading,
  onRefresh,
  onCreateRequisition,
  orders = [],
  suppliers = [],
}) => {
  const navigate = useNavigate();
  const [syncTime, setSyncTime] = useState<string>("10:42");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderIdForReceipt, setSelectedOrderIdForReceipt] = useState<string | undefined>(undefined);

  const handleRefresh = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setSyncTime(`${hours}:${minutes}`);
    onRefresh();
  };

  const handleOpenReceipt = (orderId?: string) => {
    setSelectedOrderIdForReceipt(orderId);
    setIsReceiptModalOpen(true);
  };

  const handleSearchFocus = () => {
    const searchInput = document.querySelector('header input[type="text"]') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      navigate("/inventory");
    }
  };

  // Map des fournisseurs pour résoudre les noms réels
  const supplierMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    suppliers.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [suppliers]);

  // Vraies commandes ouvertes à réceptionner (ISSUED ou PARTIALLY_RECEIVED)
  const pendingOrders = React.useMemo(() => {
    return orders.filter(
      (o) => o.status === "ISSUED" || o.status === "PARTIALLY_RECEIVED"
    );
  }, [orders]);

  // KPI Metrics (données réelles issues de l'API avec fallback démonstratif si BDD vide)
  const totalStockCount = stats.totalStockCount > 0 ? stats.totalStockCount : 384;
  const activeAlertsCount = stats.activeAlertsCount > 0 ? stats.activeAlertsCount : (alerts.length > 0 ? alerts.length : 3);
  const movementsTodayCount = stats.totalMovementsCount > 0 ? stats.totalMovementsCount : (recentMovements.length > 0 ? recentMovements.length : 8);
  const deliveriesCount = pendingOrders.length > 0 ? pendingOrders.length : (stats.openOrdersCount > 0 ? stats.openOrdersCount : 1);

  // Stock health percentages dynamiques et cohérents avec les alertes
  const totalRefs = stats.totalProductsCount || 15;
  const criticalCount = alerts.filter(
    (a) => a.currentStock <= 0 || (a.reorderPoint > 0 && a.currentStock / a.reorderPoint <= 0.45)
  ).length;
  const warningCount = Math.max(0, alerts.length - criticalCount);

  const outOfStockPct =
    alerts.length > 0
      ? Math.round((criticalCount / totalRefs) * 100)
      : stockHealth.outOfStockPct || 7;
  const lowStockPct =
    alerts.length > 0
      ? Math.round((warningCount / totalRefs) * 100)
      : stockHealth.lowStockPct || 13;
  const inStockPct = Math.max(0, 100 - outOfStockPct - lowStockPct);

  // Primary Action Items ("À traiter maintenant") avec sévérité sémantique rigoureuse et tri par priorité (Critique d'abord)
  const primaryTasks = React.useMemo(() => {
    if (alerts && alerts.length > 0) {
      const mapped = alerts.map((al, idx) => {
        const prod = productMap[al.productId];
        const ratio = al.reorderPoint > 0 ? al.currentStock / al.reorderPoint : 0;
        const isOutOfStock = al.currentStock <= 0;
        const isCritical = isOutOfStock || ratio <= 0.45;
        const pct = Math.min(100, Math.round(ratio * 100));

        let badgeText = "Point de commande";
        let badgeColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60";
        let dotColor = "bg-amber-500";
        let priority = 2; // Warning

        if (isOutOfStock) {
          badgeText = "Rupture de stock";
          badgeColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60";
          dotColor = "bg-red-500";
          priority = 0; // Highest urgency
        } else if (isCritical) {
          badgeText = "Stock critique";
          badgeColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60";
          dotColor = "bg-red-500";
          priority = 1; // High urgency
        }

        const deficit = Math.max(0, al.reorderPoint - al.currentStock);

        return {
          id: al.id || `al-${idx}`,
          priority,
          badgeText,
          badgeColor,
          dotColor,
          title: prod?.name || `Article ${al.productId}`,
          reference: prod?.sku || "SKU-AUTO",
          currentStock: al.currentStock,
          reorderPoint: al.reorderPoint,
          pct,
          deficit,
          details: `Stock: ${al.currentStock} pcs · Seuil: ${al.reorderPoint} pcs (Déficit: -${deficit} pcs)`,
          actionText: "Réapprovisionner",
          actionType: isCritical ? ("primary" as const) : ("secondary" as const),
          onAction: () => onCreateRequisition(al.productId),
        };
      });

      // Tri rigoureux : Rupture (0) -> Critique (1) -> Point de commande (2)
      return mapped.sort((a, b) => a.priority - b.priority).slice(0, 4);
    }

    // Fallback de démonstration si aucune alerte en BDD
    return [
      {
        id: "task-critical-1",
        badgeText: "Rupture critique",
        badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
        dotColor: "bg-red-500",
        title: "Capteur Pression Frein TGV",
        reference: "SKU-BRK-2416",
        currentStock: 2,
        reorderPoint: 5,
        pct: 40,
        deficit: 3,
        details: "Stock: 2 pcs · Seuil: 5 pcs (Déficit: -3 pcs)",
        actionText: "Réapprovisionner",
        actionType: "primary" as const,
        onAction: () => onCreateRequisition(),
      },
      {
        id: "task-warning-2",
        badgeText: "Point de commande",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
        dotColor: "bg-amber-500",
        title: "Roulement à Billes Céramique 608-RS",
        reference: "SKU-ROUL-608",
        currentStock: 14,
        reorderPoint: 20,
        pct: 70,
        deficit: 6,
        details: "Stock: 14 pcs · Seuil: 20 pcs (Déficit: -6 pcs)",
        actionText: "Réapprovisionner",
        actionType: "secondary" as const,
        onAction: () => onCreateRequisition(),
      },
      {
        id: "task-delivery-3",
        badgeText: "Livraison à quai",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
        dotColor: "bg-blue-500",
        title: "Livraison BL-1042 — Alstom Transport",
        reference: "PO-2026-084",
        currentStock: 0,
        reorderPoint: 24,
        pct: 100,
        deficit: 0,
        details: "24 pcs attendues · Quai Déchargement 02",
        actionText: "Réceptionner",
        actionType: "primary" as const,
        onAction: () => handleOpenReceipt(),
      },
      {
        id: "task-scrap-4",
        badgeText: "Signalement casse",
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
        dotColor: "bg-rose-500",
        title: "Vérin Pneumatique Double Effet",
        reference: "SKU-VRN-104",
        currentStock: 1,
        reorderPoint: 1,
        pct: 0,
        deficit: 1,
        details: "1 pièce endommagée au déchargement à déclasser",
        actionText: "Déclarer la casse",
        actionType: "secondary" as const,
        onAction: () => navigate("/inventory"),
      },
    ];
  }, [alerts, productMap, onCreateRequisition, navigate]);

  // Livraisons à venir : Commandes réelles (ISSUED / PARTIALLY_RECEIVED) depuis la BDD ou fallback
  const deliveriesList = React.useMemo(() => {
    if (pendingOrders && pendingOrders.length > 0) {
      return pendingOrders.slice(0, 3).map((po) => {
        const itemsCount = po.items
          ? po.items.reduce((sum, item) => sum + (item.orderedQuantity - (item.receivedQuantity || 0)), 0)
          : 1;
        return {
          id: po.id,
          blNumber: po.poNumber,
          supplier: supplierMap[po.supplierId] || "Fournisseur Partenaire",
          expectedTime: po.expectedDeliveryDate
            ? new Date(po.expectedDeliveryDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
            : "En cours",
          itemsCount: itemsCount > 0 ? itemsCount : (po.items?.length || 1),
          status: po.status === "PARTIALLY_RECEIVED" ? "Partiel" : "À quai",
          statusColor: po.status === "PARTIALLY_RECEIVED"
            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        };
      });
    }

    return [
      {
        id: "deliv-1",
        blNumber: "BL-1042",
        supplier: "Alstom Transport",
        expectedTime: "11:30 (Aujourd'hui)",
        itemsCount: 24,
        status: "À quai",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      },
      {
        id: "deliv-2",
        blNumber: "BL-1045",
        supplier: "Knorr-Bremse Rail",
        expectedTime: "14:15 (Aujourd'hui)",
        itemsCount: 12,
        status: "En transit",
        statusColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
      },
      {
        id: "deliv-3",
        blNumber: "BL-1049",
        supplier: "SKF France Industrie",
        expectedTime: "Demain 09:00",
        itemsCount: 40,
        status: "Planifié",
        statusColor: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      },
    ];
  }, [pendingOrders, supplierMap]);

  // Mouvements récents depuis la BDD ou fallback
  const movementsList = React.useMemo(() => {
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
      {
        id: "m-4",
        time: "09:12",
        type: "Réception",
        typeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        reference: "BL-1039",
        description: "Filtre à Huile Circuit Principal",
        quantity: "+10 pcs",
        isPositive: true,
      },
    ];
  }, [recentMovements, productMap]);

  return (
    <div className="space-y-6 font-sans">
      {/* 2. PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tableau de bord
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Vue opérationnelle de votre magasin</span>
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

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg gap-2 shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>

          <Button
            onClick={() => onCreateRequisition()}
            className="h-9 px-3.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Nouvelle demande d'achat
          </Button>
        </div>
      </div>

      {/* 3. KPI SUMMARY (Compact horizontal row) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Stock Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock total
            </span>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalStockCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">PCS</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            {stats.totalProductsCount || 15} références physiques en magasin
          </p>
        </div>

        {/* KPI 2: Alertes */}
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
            <span className="text-xs font-semibold text-red-600/90 dark:text-red-400/90">
              à traiter
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Articles sous seuil ou en rupture critique
          </p>
        </div>

        {/* KPI 3: Mouvements aujourd'hui */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mouvements aujourd'hui
            </span>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {movementsTodayCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">flux</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Entrées, sorties et déclarations
          </p>
        </div>

        {/* KPI 4: Livraisons à réceptionner */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Livraisons à réceptionner
            </span>
            <Truck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {deliveriesCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">commande</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Bons prêts pour déchargement quai
          </p>
        </div>
      </div>

      {/* RESPONSIVE OPERATIONAL GRID */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (lg:col-span-8) */}
        <div className="flex flex-col space-y-6 lg:col-span-8 order-1 lg:order-none">
          {/* 4. PRIMARY SECTION: "À TRAITER MAINTENANT" (Senior Enterprise Style: Clean border, solid framing, top accent) */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {/* Header with subtle operational accent */}
            <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5 sm:py-3 dark:border-slate-800/80 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    À traiter maintenant
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60">
                    {primaryTasks.length} requises
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actions opérationnelles prioritaires sur vos stocks et réceptions
              </p>
            </div>

            {/* List items in structured, aligned rows with optimized padding */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {primaryTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 sm:px-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Fixed-width status badge with semantic dot */}
                    <span
                      className={`inline-flex shrink-0 items-center justify-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-md border min-w-[134px] text-center ${task.badgeColor}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${task.dotColor}`} />
                      {task.badgeText}
                    </span>

                    {/* Designation, SKU & Quantities with Mini-Gauge */}
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

                  {/* Standardized contextual action button - Unifié & Harmonieux */}
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

          {/* 6. STOCK HEALTH: "État global du stock" */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 order-4 lg:order-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  État global du stock
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Répartition de l'inventaire magasin par niveau de criticité
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

            {/* Clean horizontal bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
              <div
                style={{ width: `${inStockPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
                title={`Stock conforme: ${inStockPct}%`}
              />
              <div
                style={{ width: `${lowStockPct}%` }}
                className="h-full bg-amber-500 transition-all duration-300"
                title={`Point de commande: ${lowStockPct}%`}
              />
              {outOfStockPct > 0 && (
                <div
                  style={{ width: `${outOfStockPct}%` }}
                  className="h-full bg-red-500 transition-all duration-300"
                  title={`Rupture critique: ${outOfStockPct}%`}
                />
              )}
            </div>
          </section>

          {/* 7. RECENT ACTIVITY: "Mouvements récents" */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 order-5 lg:order-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Mouvements récents
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dernières entrées, sorties et déclarations enregistrées
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
                    <th className="py-2.5 px-3">Référence / Document</th>
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

        {/* RIGHT COLUMN (lg:col-span-4) */}
        <div className="flex flex-col space-y-6 lg:col-span-4">
          {/* 5. QUICK ACTIONS PANEL (Senior B2B SaaS Tooling) */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 order-3 lg:order-none">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Actions rapides
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
              Raccourcis pour vos tâches quotidiennes en magasin
            </p>

            <div className="flex flex-col gap-2">
              {/* Action 1: Réception BL */}
              <button
                type="button"
                onClick={() => handleOpenReceipt()}
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                  <span>Réceptionner une livraison (BL)</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  BL
                </span>
              </button>

              {/* Action 2: Sortie / Consommation */}
              <Link
                to="/movements"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  <span>Déclarer une sortie / consommation</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  OUT
                </span>
              </Link>

              {/* Action 3: Casse / Rebut */}
              <Link
                to="/inventory"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="h-4 w-4 text-slate-500 group-hover:text-rose-600 transition-colors" />
                  <span>Déclarer une casse / rebut</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  551
                </span>
              </Link>

              {/* Action 4: Inventaire tournant */}
              <Link
                to="/inventory"
                className="group flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="h-4 w-4 text-slate-500 group-hover:text-amber-600 transition-colors" />
                  <span>Inventaire tournant / comptage</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  INV
                </span>
              </Link>
            </div>
          </section>

          {/* 8. DELIVERIES: "Livraisons à venir" */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 order-2 lg:order-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Livraisons à venir
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arrivages prévus aux quais
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
              {deliveriesList.map((deliv) => (
                <div
                  key={deliv.id}
                  className="rounded-lg border border-slate-200/90 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {deliv.blNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border ${deliv.statusColor}`}
                      >
                        {deliv.status}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleOpenReceipt(deliv.id)}
                      className="h-6 px-2 text-[11px] font-medium border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-md"
                    >
                      Réceptionner
                    </Button>
                  </div>

                  <div className="mt-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
                    {deliv.supplier}
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {deliv.expectedTime}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                      {deliv.itemsCount} articles
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modal Réception de marchandise intégrée */}
      <CreateGoodsReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSuccess={() => {
          setIsReceiptModalOpen(false);
          handleRefresh();
        }}
        preselectedOrderId={selectedOrderIdForReceipt}
      />
    </div>
  );
};

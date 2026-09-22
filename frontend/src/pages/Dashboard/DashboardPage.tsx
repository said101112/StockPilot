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
import type { Product } from "@/features/products/domain/types";
import CreateSupplierModal from "@/features/suppliers/components/CreateSupplierModal";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import CreateRequisitionModal from "@/features/procurement/components/CreateRequisitionModal";
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
  Truck,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStockCount: 0,
    totalValuation: 0,
    activeAlertsCount: 0,
    openOrdersCount: 0,
    openOrdersValue: 0,
    totalMovementsCount: 0,
    totalSuppliersCount: 0,
    totalProductsCount: 0,
  });

  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [stockHealth, setStockHealth] = useState({
    inStockPct: 100,
    lowStockPct: 0,
    outOfStockPct: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [selectedProductForDA, setSelectedProductForDA] = useState<string>("");

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

      const pMap: Record<string, Product> = {};
      prodList.forEach((p) => {
        pMap[p.id] = p;
      });
      setProductMap(pMap);

      // Calcul de la valorisation totale
      let valuation = 0;
      invList.forEach((item) => {
        const prod = pMap[item.productId];
        if (prod && prod.price) {
          valuation += item.quantityOnHand * prod.price;
        }
      });

      // Commandes ouvertes
      const openPOs = poList.filter((po) => po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED");
      const openPOsVal = openPOs.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

      // Calcul de santé des stocks
      const totalInv = invList.length;
      if (totalInv > 0) {
        const outCount = invList.filter((i) => i.quantityOnHand === 0).length;
        const lowCount = invList.filter((i) => i.quantityOnHand > 0 && i.quantityOnHand <= i.reorderPoint).length;
        const normalCount = totalInv - outCount - lowCount;
        setStockHealth({
          inStockPct: Math.round((normalCount / totalInv) * 100),
          lowStockPct: Math.round((lowCount / totalInv) * 100),
          outOfStockPct: Math.round((outCount / totalInv) * 100),
        });
      }

      setStats({
        totalStockCount: invList.reduce((acc, curr) => acc + curr.quantityOnHand, 0),
        totalValuation: valuation,
        activeAlertsCount: alertList.length,
        openOrdersCount: openPOs.length,
        openOrdersValue: openPOsVal,
        totalMovementsCount: movList.length,
        totalSuppliersCount: suppList.length,
        totalProductsCount: prodList.length,
      });

      setAlerts(alertList.slice(0, 5));
      setRecentMovements(movList.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateDAForProduct = (productId: string) => {
    setSelectedProductForDA(productId);
    setIsRequisitionModalOpen(true);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <Badge color="error">Rupture Totale</Badge>;
      case "HIGH":
        return <Badge color="warning">Stock Critique</Badge>;
      case "MEDIUM":
        return <Badge color="primary">Seuil Atteint</Badge>;
      default:
        return <Badge color="light">{sev}</Badge>;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "GOODS_RECEIPT_PO":
        return <Badge color="success">Réception Fournisseur</Badge>;
      case "SCRAP_DAMAGED":
        return <Badge color="error">Casse Déclarée</Badge>;
      case "INTERNAL_CONSUMPTION":
        return <Badge color="warning">Sortie Atelier</Badge>;
      case "INITIAL_STOCK":
        return <Badge color="primary">Stock Initial</Badge>;
      default:
        return <Badge color="light">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Titre & Actions Principales */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <StockPilotLogo size="lg" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Tableau de Bord — Pilotage des Stocks & Approvisionnements
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supervision des niveaux de stock en temps réel, gestion des alertes et suivi des réapprovisionnements
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" onClick={loadDashboardData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            onClick={() => setIsSupplierModalOpen(true)}
            className="gap-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700"
          >
            <Building2 className="h-4 w-4" />
            Nouveau Fournisseur
          </Button>
          <Button
            onClick={() => setIsProductModalOpen(true)}
            className="gap-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700"
          >
            <Boxes className="h-4 w-4" />
            Nouvel Article
          </Button>
          <Button
            onClick={() => {
              setSelectedProductForDA("");
              setIsRequisitionModalOpen(true);
            }}
            className="gap-2 bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Demande d'Achat
          </Button>
        </div>
      </div>

      {/* Cartes KPI Principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stock Physique Total */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:border-brand-500/30">
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
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{stats.totalProductsCount} référence(s)</span>
              {stats.totalValuation > 0 && (
                <span className="font-semibold text-brand-600 dark:text-brand-400 font-mono">
                  ~ {stats.totalValuation.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alertes de Réappro */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:border-amber-500/30">
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
              {stats.activeAlertsCount === 0
                ? "Tous les stocks sont au-dessus du seuil"
                : "Articles nécessitant un réapprovisionnement"}
            </p>
          </div>
        </div>

        {/* Commandes en Cours */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:border-brand-500/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Commandes Fournisseurs
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
              {stats.openOrdersValue > 0
                ? `${stats.openOrdersValue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € engagés`
                : "Commandes en attente de livraison"}
            </p>
          </div>
        </div>

        {/* Mouvements Traçables */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:border-emerald-500/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mouvements Enregistrés
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
              Historique certifié des entrées et sorties
            </p>
          </div>
        </div>
      </div>

      {/* Widget : Santé Globale des Stocks */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Santé Globale des Stocks
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-600 dark:text-gray-300">Stock Conforme ({stockHealth.inStockPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-gray-600 dark:text-gray-300">Point de Commande ({stockHealth.lowStockPct}%)</span>
            </div>
            {stockHealth.outOfStockPct > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-gray-600 dark:text-gray-300">Rupture ({stockHealth.outOfStockPct}%)</span>
              </div>
            )}
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex">
          <div
            style={{ width: `${stockHealth.inStockPct}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Stock Conforme: ${stockHealth.inStockPct}%`}
          />
          <div
            style={{ width: `${stockHealth.lowStockPct}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Proche du seuil: ${stockHealth.lowStockPct}%`}
          />
          <div
            style={{ width: `${stockHealth.outOfStockPct}%` }}
            className="h-full bg-rose-500 transition-all duration-500"
            title={`Rupture: ${stockHealth.outOfStockPct}%`}
          />
        </div>
      </div>

      {/* Grid: Alertes Récentes Spécifiques + Raccourcis Opérations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Panneau des Alertes avec Vrais Articles & Jauge */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Alertes de Stock Nécessitant une Action
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
              alerts.map((al) => {
                const prod = productMap[al.productId];
                const pct = al.reorderPoint > 0 ? Math.min(100, Math.round((al.currentStock / al.reorderPoint) * 100)) : 0;

                return (
                  <div
                    key={al.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {prod ? prod.name : "Article"}
                        </span>
                        <span className="rounded-md bg-gray-200/70 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {prod ? prod.sku : al.productId.substring(0, 8)}
                        </span>
                        {getSeverityBadge(al.severity)}
                      </div>

                      {/* Jauge visuelle de niveau de stock */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="h-2 w-36 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full ${
                              al.currentStock === 0
                                ? "bg-rose-600"
                                : pct <= 50
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Actuel : <strong className="text-gray-900 dark:text-white">{al.currentStock} PCS</strong> / Seuil : {al.reorderPoint} PCS
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCreateDAForProduct(al.productId)}
                        className="gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white w-full sm:w-auto"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Commander (Créer DA)
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Raccourcis Opérations Rapides */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Raccourcis Logistiques
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Actions directes sur la chaîne d'approvisionnement
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              {/* Créer une Demande d'Achat */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProductForDA("");
                  setIsRequisitionModalOpen(true);
                }}
                className="flex items-center gap-3 w-full rounded-xl border border-purple-200/70 bg-purple-50/40 p-3 text-left text-sm font-semibold text-purple-950 transition-colors hover:bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 shrink-0">
                  <FilePlus2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Nouvelle Demande d'Achat</span>
                  <span className="block text-[11px] font-normal text-purple-700/80 dark:text-purple-300/70">
                    Formuler un besoin de réapprovisionnement
                  </span>
                </div>
              </button>

              {/* Réceptionner une Commande */}
              <Link
                to="/goods-receipt"
                className="flex items-center gap-3 w-full rounded-xl border border-teal-200/70 bg-teal-50/40 p-3 text-left text-sm font-semibold text-teal-950 transition-colors hover:bg-teal-50 dark:border-teal-900/40 dark:bg-teal-950/20 dark:text-teal-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Réceptionner une Livraison</span>
                  <span className="block text-[11px] font-normal text-teal-700/80 dark:text-teal-300/70">
                    Enregistrer l'arrivée de marchandises au quai
                  </span>
                </div>
              </Link>

              {/* Déclarer une Casse */}
              <Link
                to="/inventory"
                className="flex items-center gap-3 w-full rounded-xl border border-rose-200/70 bg-rose-50/40 p-3 text-left text-sm font-semibold text-rose-950 transition-colors hover:bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Déclarer une Casse / Rebut</span>
                  <span className="block text-[11px] font-normal text-rose-700/80 dark:text-rose-300/70">
                    Sortie de stock immédiate pour produit endommagé
                  </span>
                </div>
              </Link>

              {/* Ajouter un Article */}
              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-brand-500"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shrink-0">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Ajouter un Article</span>
                  <span className="block text-[11px] font-normal text-gray-400">
                    Enregistrer une nouvelle référence au catalogue
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 text-center">
            StockPilot • Gestion Intelligente des Flux
          </div>
        </div>
      </div>

      {/* Tableau des Derniers Mouvements avec Vrais Articles */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Derniers Mouvements de Stock
            </h2>
          </div>
          <Link
            to="/movements"
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Historique complet <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3">N° Mouvement</th>
                <th className="px-4 py-3">Opération</th>
                <th className="px-4 py-3">Article & Référence</th>
                <th className="px-4 py-3 text-center">Quantité</th>
                <th className="px-4 py-3">Référence / Motif</th>
                <th className="px-4 py-3 text-right">Date & Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                    Aucun mouvement enregistré pour l'instant.
                  </td>
                </tr>
              ) : (
                recentMovements.map((mov) => {
                  const prod = productMap[mov.productId];

                  return (
                    <tr key={mov.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {mov.movementNumber}
                      </td>
                      <td className="px-4 py-3">{getMovementTypeBadge(mov.type)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white text-xs">
                            {prod ? prod.name : "Article"}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            Réf : {prod ? prod.sku : mov.productId.substring(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
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
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 text-right">
                        {new Date(mov.timestamp).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals de Création */}
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

      <CreateRequisitionModal
        isOpen={isRequisitionModalOpen}
        onClose={() => setIsRequisitionModalOpen(false)}
        onSuccess={() => {
          loadDashboardData();
        }}
        initialProductId={selectedProductForDA}
      />
    </div>
  );
}

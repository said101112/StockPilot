import { useEffect, useState, useCallback } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import type { DashboardStats, StockHealth } from "./types";
import { AdminDashboard } from "./AdminDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { UserDashboard } from "./UserDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalStockCount: 0,
    totalValuation: 0,
    activeAlertsCount: 0,
    openOrdersCount: 0,
    openOrdersValue: 0,
    totalMovementsCount: 0,
    totalSuppliersCount: 0,
    totalProductsCount: 0,
    pendingRequisitionsCount: 0,
  });

  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [stockHealth, setStockHealth] = useState<StockHealth>({
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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [invList, alertList, poList, movList, suppList, prodList, reqList] =
        await Promise.all([
          inventoryApi.getAll().catch(() => []),
          alertsApi.getActive().catch(() => []),
          procurementApi.getOrders().catch(() => []),
          movementsApi.getAll().catch(() => []),
          suppliersApi.getAll().catch(() => []),
          productsApi.getAll().catch(() => []),
          procurementApi.getRequisitions().catch(() => []),
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
      const openPOs = poList.filter(
        (po) => po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED"
      );
      const openPOsVal = openPOs.reduce(
        (acc, curr) => acc + (curr.totalAmount || 0),
        0
      );

      // Demandes d'achat en attente d'approbation
      const pendingReqs = reqList.filter((r) => r.status === "SUBMITTED").length;

      // Calcul de la santé globale des stocks
      const totalInv = invList.length;
      if (totalInv > 0) {
        const outCount = invList.filter((i) => i.quantityOnHand === 0).length;
        const lowCount = invList.filter(
          (i) => i.quantityOnHand > 0 && i.quantityOnHand <= i.reorderPoint
        ).length;
        const normalCount = totalInv - outCount - lowCount;
        setStockHealth({
          inStockPct: Math.round((normalCount / totalInv) * 100),
          lowStockPct: Math.round((lowCount / totalInv) * 100),
          outOfStockPct: Math.round((outCount / totalInv) * 100),
        });
      }

      setStats({
        totalStockCount: invList.reduce(
          (acc, curr) => acc + curr.quantityOnHand,
          0
        ),
        totalValuation: valuation,
        activeAlertsCount: alertList.length,
        openOrdersCount: openPOs.length,
        openOrdersValue: openPOsVal,
        totalMovementsCount: movList.length,
        totalSuppliersCount: suppList.length,
        totalProductsCount: prodList.length,
        pendingRequisitionsCount: pendingReqs,
      });

      // Tri des alertes et mouvements récents du plus récent au plus ancien
      const sortedAlerts = [...(alertList || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const sortedMovements = [...(movList || [])].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAlerts(sortedAlerts.slice(0, 5));
      setRecentMovements(sortedMovements.slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleOpenRequisition = (productId?: string) => {
    setSelectedProductForDA(productId || "");
    setIsRequisitionModalOpen(true);
  };

  const sharedProps = {
    stats,
    alerts,
    recentMovements,
    productMap,
    stockHealth,
    loading,
    onRefresh: loadDashboardData,
    onCreateRequisition: handleOpenRequisition,
  };

  return (
    <>
      {/* Affichage du Dashboard spécialisé selon le rôle utilisateur */}
      {user?.role === "MANAGER" ? (
        <ManagerDashboard
          {...sharedProps}
          onCreateSupplier={() => setIsSupplierModalOpen(true)}
        />
      ) : user?.role === "USER" ? (
        <UserDashboard {...sharedProps} />
      ) : (
        <AdminDashboard
          {...sharedProps}
          onCreateSupplier={() => setIsSupplierModalOpen(true)}
          onCreateProduct={() => setIsProductModalOpen(true)}
        />
      )}

      {/* Modals globales pilotées par le Dashboard */}
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
    </>
  );
}

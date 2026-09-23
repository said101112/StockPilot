import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import type { PurchaseOrder } from "@/features/procurement/domain/types";
import type { Supplier } from "@/features/suppliers/domain/types";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import CreateGoodsReceiptModal from "@/features/goods-receipt/components/CreateGoodsReceiptModal";
import { useToast } from "@/shared/context/ToastContext";
import {
  ShoppingCart,
  RefreshCw,
  Send,
  AlertCircle,
  ShoppingBag,
  Building2,
  Ban,
  Truck,
  Check,
} from "lucide-react";


export default function OrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [supplierMap, setSupplierMap] = useState<Record<string, Supplier>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cancel order modal
  const [orderToCancel, setOrderToCancel] = useState<PurchaseOrder | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Goods receipt modal
  const [orderToReceive, setOrderToReceive] = useState<PurchaseOrder | null>(null);

  const { showSuccess, showError } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, suppliersData] = await Promise.all([
        procurementApi.getOrders(),
        suppliersApi.getAll().catch(() => []),
      ]);

      setOrders(ordersData || []);

      const sMap: Record<string, Supplier> = {};
      suppliersData.forEach((s) => {
        sMap[s.id] = s;
      });
      setSupplierMap(sMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des Bons de Commande");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleIssue = async (id: string) => {
    try {
      setActionLoading(id);
      await procurementApi.issueOrder(id);
      showSuccess("Bon de commande envoyé au fournisseur.");
      await fetchOrders();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erreur lors de l'envoi de la commande");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    try {
      setCancelLoading(true);
      await procurementApi.cancelOrder(orderToCancel.id);
      showSuccess(`Le bon de commande "${orderToCancel.poNumber}" a été annulé.`);
      setOrderToCancel(null);
      await fetchOrders();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erreur lors de l'annulation de la commande");
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge color="light">Brouillon</Badge>;
      case "ISSUED":
        return <Badge color="primary">Envoyée au Fournisseur</Badge>;
      case "PARTIALLY_RECEIVED":
        return <Badge color="warning">Réception Partielle</Badge>;
      case "COMPLETED":
        return <Badge color="success">Livrée & Soldée</Badge>;
      case "CANCELLED":
        return <Badge color="error">Annulée</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Commandes Fournisseurs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Suivi des commandes émises et livraisons attendues
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={fetchOrders} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tableau des Commandes */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-3 sm:px-4 py-3.5">N° Commande</th>
                <th className="px-3 sm:px-4 py-3.5">Fournisseur</th>
                <th className="px-3 sm:px-4 py-3.5">Montant Total</th>
                <th className="px-3 sm:px-4 py-3.5">Statut</th>
                <th className="px-3 sm:px-4 py-3.5">Date Livraison Prévue</th>
                <th className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des commandes en cours...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <ShoppingBag className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucune commande d'achat</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Les commandes créées depuis les Demandes d'Achat approuvées s'afficheront ici.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  const supplier = supplierMap[po.supplierId];
                  return (
                    <tr
                      key={po.id}
                      className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                    >
                      <td className="px-3 sm:px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                        {po.poNumber}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {supplier ? supplier.name : "Fournisseur Partenaire"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {po.totalAmount.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {po.currency || "EUR"}
                      </td>
                      <td className="px-3 sm:px-4 py-3">{getStatusBadge(po.status)}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {po.expectedDeliveryDate
                          ? new Date(po.expectedDeliveryDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "À convenir"}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {po.status === "DRAFT" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleIssue(po.id)}
                                disabled={actionLoading === po.id}
                                title="Envoyer la commande au fournisseur"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors disabled:opacity-50"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setOrderToCancel(po)}
                                title="Annuler la commande"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {po.status === "ISSUED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setOrderToReceive(po)}
                                title="Réceptionner la commande au quai"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
                              >
                                <Truck className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setOrderToCancel(po)}
                                title="Annuler la commande en cours"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {po.status === "PARTIALLY_RECEIVED" && (
                            <button
                              type="button"
                              onClick={() => setOrderToReceive(po)}
                              title="Solder la réception au quai"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                          )}
                          {po.status === "COMPLETED" && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              <Check className="h-3.5 w-3.5" />
                              100%
                            </span>
                          )}
                          {po.status === "CANCELLED" && (
                            <span className="text-xs text-rose-500 font-medium">
                              Annulée
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!orderToCancel}
        title="Annuler le bon de commande"
        message={`Êtes-vous sûr de vouloir annuler le bon de commande "${orderToCancel?.poNumber}" ? Cette action annulera formellement la commande auprès du fournisseur.`}
        confirmLabel="Confirmer l'annulation"
        variant="danger"
        isLoading={cancelLoading}
        onConfirm={handleCancelConfirm}
        onCancel={() => setOrderToCancel(null)}
      />

      {/* Goods Receipt Modal */}
      <CreateGoodsReceiptModal
        isOpen={!!orderToReceive}
        preselectedOrderId={orderToReceive?.id}
        onClose={() => setOrderToReceive(null)}
        onSuccess={() => {
          setOrderToReceive(null);
          fetchOrders();
        }}
      />
    </div>
  );
}


import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { goodsReceiptApi } from "@/features/goods-receipt/api/goodsReceiptApi";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import type { GoodsReceipt } from "@/features/goods-receipt/domain/types";
import type { PurchaseOrder } from "@/features/procurement/domain/types";
import CreateGoodsReceiptModal from "@/features/goods-receipt/components/CreateGoodsReceiptModal";
import GoodsReceiptDetailModal from "@/features/goods-receipt/components/GoodsReceiptDetailModal";
import {
  Truck,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  ShoppingCart,
  Plus,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function GoodsReceiptPage() {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [orderMap, setOrderMap] = useState<Record<string, PurchaseOrder>>({});
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailReceipt, setDetailReceipt] = useState<GoodsReceipt | null>(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [receiptsData, ordersData] = await Promise.all([
        goodsReceiptApi.getAll(),
        procurementApi.getOrders().catch(() => []),
      ]);

      // Sort newest first
      const sortedReceipts = [...(receiptsData || [])].sort(
        (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      );
      setReceipts(sortedReceipts);

      const oMap: Record<string, PurchaseOrder> = {};
      let pending = 0;
      ordersData.forEach((o) => {
        oMap[o.id] = o;
        if (o.status === "ISSUED" || o.status === "PARTIALLY_RECEIVED") {
          pending++;
        }
      });
      setOrderMap(oMap);
      setPendingOrdersCount(pending);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des bons de réception");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const totalLinesReceived = receipts.reduce(
    (acc, gr) => acc + (gr.items ? gr.items.length : 1),
    0
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'enregistrement Quai */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Réceptions Marchandises
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contrôle physique des camions au quai et entrée en stock magasin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={fetchReceipts} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <Truck className="h-4 w-4" />
            Enregistrer une Réception
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cartes KPI Synthèse Opérationnelle Quai */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Réceptions Archivées
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {receipts.length}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              ({totalLinesReceived} lignes d'articles)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              En Attente au Quai
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingOrdersCount}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              commandes émises prêtes à réceptionner
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dernière Livraison
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {receipts.length > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                  {receipts[0].grNumber}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  ({new Date(receipts[0].receivedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })})
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Aucune réception récente</span>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des Réceptions Spécifique et Lisible */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Bon Réception</th>
                <th className="px-6 py-4">Bon de Livraison (BL)</th>
                <th className="px-6 py-4">Commande Rattachée</th>
                <th className="px-6 py-4 text-center">Quantité Réceptionnée</th>
                <th className="px-6 py-4">Remarques / Contrôle</th>
                <th className="px-6 py-4">Date de Réception</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-teal-600 mb-2" />
                    Chargement des réceptions...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <PackageCheck className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucune réception enregistrée</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Lorsqu'un camion fournisseur arrive au quai, cliquez sur le bouton ci-dessous pour enregistrer la livraison.
                    </p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-4 gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Enregistrer la première réception
                    </Button>
                  </td>
                </tr>
              ) : (
                receipts.map((gr) => {
                  const po = gr.purchaseOrderId ? orderMap[gr.purchaseOrderId] : null;

                  return (
                    <tr
                      key={gr.id}
                      className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => setDetailReceipt(gr)}
                          className="hover:text-teal-600 dark:hover:text-teal-400 hover:underline"
                        >
                          {gr.grNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">
                        {gr.deliveryNoteNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                          <ShoppingCart className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="font-mono font-semibold">
                            {po ? po.poNumber : "Commande Fournisseur"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-mono">
                          {gr.items ? `${gr.items.length} ligne(s)` : "1 ligne"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                        {gr.notes || "Réception conforme au quai"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {new Date(gr.receivedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDetailReceipt(gr)}
                          className="gap-1.5 text-xs text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Détails
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'enregistrement au quai */}
      <CreateGoodsReceiptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchReceipts}
      />

      {/* Modal de consultation des détails */}
      <GoodsReceiptDetailModal
        isOpen={!!detailReceipt}
        onClose={() => setDetailReceipt(null)}
        receipt={detailReceipt}
        order={detailReceipt?.purchaseOrderId ? orderMap[detailReceipt.purchaseOrderId] : null}
      />
    </div>
  );
}

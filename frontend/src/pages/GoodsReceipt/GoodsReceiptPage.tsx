import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { goodsReceiptApi } from "@/features/goods-receipt/api/goodsReceiptApi";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import type { GoodsReceipt } from "@/features/goods-receipt/domain/types";
import type { PurchaseOrder } from "@/features/procurement/domain/types";
import { Truck, RefreshCw, AlertCircle, PackageCheck, ShoppingCart } from "lucide-react";

export default function GoodsReceiptPage() {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [orderMap, setOrderMap] = useState<Record<string, PurchaseOrder>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [receiptsData, ordersData] = await Promise.all([
        goodsReceiptApi.getAll(),
        procurementApi.getOrders().catch(() => []),
      ]);

      setReceipts(receiptsData || []);

      const oMap: Record<string, PurchaseOrder> = {};
      ordersData.forEach((o) => {
        oMap[o.id] = o;
      });
      setOrderMap(oMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des bons de réception");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Réceptions de Marchandises
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contrôle physique des livraisons fournisseurs et enregistrement des entrées en stock
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={fetchReceipts} disabled={loading} className="gap-2">
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
                <th className="px-6 py-4 text-right">Date de Réception</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des réceptions...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <PackageCheck className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucune réception enregistrée</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Les entrées en stock sur livraison fournisseur apparaîtront ici.
                    </p>
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
                        {gr.grNumber}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
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
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {gr.notes || "Réception conforme au quai"}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {new Date(gr.receivedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
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
    </div>
  );
}

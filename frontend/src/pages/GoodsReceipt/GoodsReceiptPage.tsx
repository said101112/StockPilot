import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { goodsReceiptApi } from "@/features/goods-receipt/api/goodsReceiptApi";
import type { GoodsReceipt } from "@/features/goods-receipt/domain/types";

export default function GoodsReceiptPage() {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goodsReceiptApi.getAll();
      setReceipts(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des bons de réception");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📥 Réceptions de Marchandises (Goods Receipt / MIGO)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Attestation d'entrée physique en magasin adossée au Bon de Livraison (BL) et au Bon de Commande (SAP 101)
          </p>
        </div>
        <Button variant="outline" onClick={fetchReceipts} disabled={loading}>
          🔄 Actualiser
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Réception (GR)</th>
                <th className="px-6 py-4">Bon de Livraison (BL)</th>
                <th className="px-6 py-4">Commande Réf (PO ID)</th>
                <th className="px-6 py-4 text-center">Lignes Réceptionnées</th>
                <th className="px-6 py-4">Remarques / Quai</th>
                <th className="px-6 py-4 text-right">Date Réception</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Chargement des réceptions...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun bon de réception enregistré.
                  </td>
                </tr>
              ) : (
                receipts.map((gr) => (
                  <tr
                    key={gr.id}
                    className="hover:bg-gray-50/50 transition dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {gr.grNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-600 dark:text-brand-400">
                      {gr.deliveryNoteNumber}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {gr.purchaseOrderId.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {gr.items?.length || 0}
                      </span>{" "}
                      article(s)
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{gr.notes || "—"}</td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(gr.receivedAt).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

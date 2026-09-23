import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { GoodsReceipt } from "../domain/types";
import type { PurchaseOrder } from "@/features/procurement/domain/types";
import { Truck, FileText, ShoppingCart, Calendar, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receipt: GoodsReceipt | null;
  order?: PurchaseOrder | null;
}

export default function GoodsReceiptDetailModal({
  isOpen,
  onClose,
  receipt,
  order,
}: Props) {
  if (!receipt) return null;

  const totalQuantity = (receipt.items || []).reduce(
    (acc, it) => acc + (it.receivedQuantity || 0),
    0
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 shrink-0">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
              {receipt.grNumber}
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Réception Conforme
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fiche officielle d'entrée en stock magasin et contrôle quai
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Grille des Métadonnées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
              <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              N° Bon de Livraison Transporteur (BL) :
            </span>
            <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
              {receipt.deliveryNoteNumber}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
              <ShoppingCart className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              Commande Fournisseur Associée :
            </span>
            <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
              {order ? order.poNumber : "Commande rattachée"}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              Date et Heure de Réception :
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {new Date(receipt.receivedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              Contrôle Quai / Remarques :
            </span>
            <span className="font-medium text-gray-900 dark:text-white italic">
              {receipt.notes || "Réception conforme au quai de déchargement."}
            </span>
          </div>
        </div>

        {/* Tableau des Articles Réceptionnés */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
            Articles Déchargés et Entrés en Stock
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-2.5">Désignation Produit</th>
                  <th className="px-3 py-2.5">Référence SKU</th>
                  <th className="px-4 py-2.5 text-right font-bold text-teal-600 dark:text-teal-400">
                    Quantité Entrée
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {it.productName || "Article en stock"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {it.sku || "SKU-N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-mono">
                          +{it.receivedQuantity} unités
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                      Aucun détail de ligne disponible
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50/75 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 font-bold text-xs">
                <tr>
                  <td colSpan={2} className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                    Total physique réceptionné
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-teal-700 dark:text-teal-300 text-sm">
                    {totalQuantity} unités
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Pied de modal */}
      <div className="mt-6 flex items-center justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </Modal>
  );
}

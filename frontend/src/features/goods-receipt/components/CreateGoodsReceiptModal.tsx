import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import { goodsReceiptApi } from "../api/goodsReceiptApi";
import type { PurchaseOrder, PurchaseOrderItem } from "@/features/procurement/domain/types";
import type { Supplier } from "@/features/suppliers/domain/types";
import { useToast } from "@/shared/context/ToastContext";
import {
  Truck,
  CheckCircle,
  AlertCircle,
  PackageCheck,
  Building2,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedOrderId?: string;
}

export default function CreateGoodsReceiptModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedOrderId,
}: Props) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [supplierMap, setSupplierMap] = useState<Record<string, Supplier>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("Colis contrôlés au quai de déchargement, conformes.");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadEligibleOrders();
    }
  }, [isOpen, preselectedOrderId]);

  const loadEligibleOrders = async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      const [allOrders, suppliersData] = await Promise.all([
        procurementApi.getOrders(),
        suppliersApi.getAll().catch(() => []),
      ]);

      const sMap: Record<string, Supplier> = {};
      suppliersData.forEach((s) => {
        sMap[s.id] = s;
      });
      setSupplierMap(sMap);

      // Only orders that are ISSUED or PARTIALLY_RECEIVED can be received at the dock
      const eligible = (allOrders || []).filter(
        (o) => o.status === "ISSUED" || o.status === "PARTIALLY_RECEIVED"
      );
      setOrders(eligible);

      // Choose active order
      let initialOrderId = "";
      if (preselectedOrderId && eligible.some((o) => o.id === preselectedOrderId)) {
        initialOrderId = preselectedOrderId;
      } else if (eligible.length > 0) {
        initialOrderId = eligible[0].id;
      }

      setSelectedOrderId(initialOrderId);

      if (initialOrderId) {
        const order = eligible.find((o) => o.id === initialOrderId);
        if (order) {
          initializeQuantitiesForOrder(order);
        }
      }

      // Generate suggested delivery note ref if empty
      if (!deliveryNoteNumber) {
        const randomRef = Math.floor(1000 + Math.random() * 9000);
        setDeliveryNoteNumber(`BL-FRN-2026-${randomRef}`);
      }
    } catch {
      setError("Impossible de charger les commandes éligibles pour réception.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const getRemainingQty = (item: PurchaseOrderItem): number => {
    if (typeof item.remainingQuantity === "number") {
      return item.remainingQuantity;
    }
    return Math.max(0, item.orderedQuantity - (item.receivedQuantity || 0));
  };

  const initializeQuantitiesForOrder = (order: PurchaseOrder) => {
    const initialQtys: Record<string, number> = {};
    order.items?.forEach((item) => {
      const remaining = getRemainingQty(item);
      initialQtys[item.productId] = remaining;
    });
    setItemQuantities(initialQtys);
  };

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      initializeQuantitiesForOrder(order);
    }
  };

  const handleQuantityChange = (productId: string, val: string, maxRemaining: number) => {
    const num = parseInt(val, 10);
    const validNum = isNaN(num) ? 0 : Math.min(Math.max(0, num), maxRemaining);
    setItemQuantities((prev) => ({
      ...prev,
      [productId]: validNum,
    }));
  };

  const handleResetToAllRemaining = () => {
    const activeOrder = orders.find((o) => o.id === selectedOrderId);
    if (activeOrder) {
      initializeQuantitiesForOrder(activeOrder);
    }
  };

  const activeOrder = orders.find((o) => o.id === selectedOrderId);
  const activeSupplier = activeOrder ? supplierMap[activeOrder.supplierId] : null;

  const totalUnitsToReceive = Object.values(itemQuantities).reduce((acc, q) => acc + (q || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !activeOrder) {
      setError("Veuillez sélectionner un bon de commande fournisseur.");
      return;
    }

    if (!deliveryNoteNumber.trim()) {
      setError("Le numéro de bon de livraison (BL) transporteur est obligatoire.");
      return;
    }

    // Filter items with receivedQuantity > 0
    const itemsToSubmit = Object.entries(itemQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({
        productId,
        receivedQuantity: qty,
      }));

    if (itemsToSubmit.length === 0) {
      setError("Veuillez renseigner une quantité reçue supérieure à zéro pour au moins un article.");
      return;
    }

    // Validate quantities do not exceed remaining
    for (const item of activeOrder.items || []) {
      const enteredQty = itemQuantities[item.productId] || 0;
      const rem = getRemainingQty(item);
      if (enteredQty > rem) {
        setError(
          `La quantité pour ${item.productName} (${enteredQty}) ne peut pas dépasser le reste à recevoir (${rem}).`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await goodsReceiptApi.create({
        purchaseOrderId: selectedOrderId,
        deliveryNoteNumber: deliveryNoteNumber.trim(),
        notes: notes.trim(),
        items: itemsToSubmit,
      });

      showSuccess(
        `Réception enregistrée avec succès (${response.grNumber}). Le stock a été incrémenté !`
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la réception";
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
      {/* En-tête du Modal */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 shrink-0">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Enregistrer une Réception Marchandises
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Contrôle physique des colis au quai de déchargement et entrée en stock magasin
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingOrders ? (
        <div className="py-12 text-center text-sm text-gray-500">
          <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          Recherche des commandes en attente de livraison au quai...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <PackageCheck className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Aucune commande en attente de livraison
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Toutes les commandes sont déjà livrées ou aucune commande n'a encore été envoyée au
            fournisseur. Émettez une commande depuis l'onglet <strong>Commandes Fournisseurs</strong>{" "}
            pour pouvoir réceptionner les marchandises ici.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Sélection de la commande fournisseur */}
          <div>
            <Label htmlFor="orderSelect" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Commande Fournisseur rattachée à la livraison *
            </Label>
            <select
              id="orderSelect"
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
              required
            >
              {orders.map((po) => {
                const s = supplierMap[po.supplierId];
                const supplierName = s ? s.name : "Fournisseur";
                const statusLabel =
                  po.status === "PARTIALLY_RECEIVED"
                    ? "Réception partielle en cours"
                    : "En attente de livraison";
                return (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} — {supplierName} ({statusLabel})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Cartouche d'informations sur la commande */}
          {activeOrder && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 dark:border-teal-900/30 dark:bg-teal-950/20 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Fournisseur : {activeSupplier ? activeSupplier.name : "Partenaire"}
                  </span>
                </div>
                {activeOrder.expectedDeliveryDate && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Livraison prévue : {new Date(activeOrder.expectedDeliveryDate).toLocaleDateString("fr-FR")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* N° BL Transporteur & Remarques de contrôle */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="deliveryNote" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  N° Bon de Livraison (BL Transporteur) *
                </Label>
                <button
                  type="button"
                  onClick={() =>
                    setDeliveryNoteNumber(`BL-FRN-2026-${Math.floor(1000 + Math.random() * 9000)}`)
                  }
                  className="text-[11px] font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Générer réf
                </button>
              </div>
              <Input
                id="deliveryNote"
                type="text"
                placeholder="ex: BL-FRN-2026-7890"
                value={deliveryNoteNumber}
                onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                required
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="qcNotes" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Remarques / Contrôle Qualité au Quai
              </Label>
              <Input
                id="qcNotes"
                type="text"
                placeholder="ex: Colis intacts, contrôlé au quai N°1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Grille de contrôle des articles reçus */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Articles et Quantités Reçues
                </Label>
                <span className="text-[11px] text-gray-500">
                  (Vérifiez chaque ligne par rapport au camion)
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetToAllRemaining}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 underline underline-offset-2"
              >
                Tout solder (100%)
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-2.5">Article & Référence</th>
                    <th className="px-3 py-2.5 text-center">Commandé</th>
                    <th className="px-3 py-2.5 text-center">Déjà reçu</th>
                    <th className="px-3 py-2.5 text-center font-bold text-teal-600 dark:text-teal-400">
                      Reste à livrer
                    </th>
                    <th className="px-4 py-2.5 text-right w-36">Quantité Reçue ce jour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {activeOrder?.items?.map((item) => {
                    const remaining = getRemainingQty(item);
                    const currentVal = itemQuantities[item.productId] ?? 0;
                    const isFullyReceived = currentVal === remaining && remaining > 0;
                    const isPartial = currentVal > 0 && currentVal < remaining;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.productName}
                          </p>
                          <span className="inline-block mt-0.5 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {item.sku}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-medium text-gray-600 dark:text-gray-400">
                          {item.orderedQuantity}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-gray-500">
                          {item.receivedQuantity || 0}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-teal-600 dark:text-teal-400">
                          {remaining}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min={0}
                              max={remaining}
                              value={currentVal}
                              onChange={(e) =>
                                handleQuantityChange(item.productId, e.target.value, remaining)
                              }
                              disabled={remaining === 0}
                              className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-right font-mono text-xs font-bold text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            {isFullyReceived && (
                              <span className="hidden sm:inline-block rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                100%
                              </span>
                            )}
                            {isPartial && (
                              <span className="hidden sm:inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Partiel
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bandeau récapitulatif & Traçabilité */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Info className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>
                La validation augmentera le stock disponible en magasin et archivera le bon de réception.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total à réceptionner :</span>
              <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                {totalUnitsToReceive} unité(s)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || totalUnitsToReceive === 0}
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              {submitting ? "Enregistrement en cours..." : "Valider l'Entrée en Stock"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

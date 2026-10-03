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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
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

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedOrderId || !activeOrder) {
      setError("Veuillez sélectionner un bon de commande fournisseur.");
      return;
    }
    if (!deliveryNoteNumber.trim()) {
      setError("Le numéro de bon de livraison (BL) transporteur est obligatoire.");
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-7">
      {/* En-tête du Modal avec Stepper Compact */}
      <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Enregistrer une Réception Marchandises
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Contrôle au quai et incrémentation immédiate du stock magasin
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              currentStep === 1
                ? "text-teal-600 dark:text-teal-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                currentStep === 1
                  ? "bg-teal-600 text-white"
                  : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
              }`}
            >
              1
            </span>
            <span>1. Identification Commande & BL</span>
          </button>

          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />

          <button
            type="button"
            onClick={() => handleNextStep()}
            className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              currentStep === 2
                ? "text-teal-600 dark:text-teal-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                currentStep === 2
                  ? "bg-teal-600 text-white"
                  : "bg-gray-150 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              2
            </span>
            <span>2. Contrôle Articles & Quantités</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingOrders ? (
        <div className="py-12 text-center text-xs text-gray-500">
          <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          Recherche des commandes en attente de livraison au quai...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <PackageCheck className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Aucune commande en attente de livraison
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Toutes les commandes sont déjà livrées ou aucune commande n'a encore été envoyée au
            fournisseur.
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={onClose} className="h-8 text-xs">
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={currentStep === 1 ? handleNextStep : handleSubmit} className="mt-4">
          {/* STEP 1: Identification & BL */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="orderSelect" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Commande Fournisseur rattachée à la livraison *
                </Label>
                <select
                  id="orderSelect"
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 shadow-2xs focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                  required
                >
                  {orders.map((po) => {
                    const s = supplierMap[po.supplierId];
                    const supplierName = s ? s.name : "Fournisseur";
                    const statusLabel =
                      po.status === "PARTIALLY_RECEIVED"
                        ? "Réception partielle en cours"
                        : "En attente";
                    return (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} — {supplierName} ({statusLabel})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Fournisseur Summary Box */}
              {activeOrder && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-teal-100 bg-teal-50/40 px-3 py-2 text-xs dark:border-teal-900/30 dark:bg-teal-950/20">
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
              )}

              {/* N° BL & QC Notes */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="deliveryNote" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      N° Bon de Livraison (BL) *
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
                    className="font-mono h-9 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="qcNotes" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Contrôle Quai / État des Colis
                  </Label>
                  <Input
                    id="qcNotes"
                    type="text"
                    placeholder="ex: Colis intacts, contrôlé au quai N°1"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-2xs"
                >
                  Continuer vers le contrôle des articles →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Contrôle Articles & Quantités */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              {/* Context Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {activeOrder?.poNumber}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                    {activeSupplier?.name}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-teal-700 dark:text-teal-300 font-semibold">
                    BL: {deliveryNoteNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetToAllRemaining}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline underline-offset-2"
                >
                  Tout solder (100%)
                </button>
              </div>

              {/* Table with controlled internal max height if many articles, NO modal scroll */}
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 z-10">
                      <tr>
                        <th className="px-3.5 py-2">Article & Réf.</th>
                        <th className="px-2.5 py-2 text-center">Cmd.</th>
                        <th className="px-2.5 py-2 text-center">Reçu</th>
                        <th className="px-2.5 py-2 text-center font-bold text-teal-600 dark:text-teal-400">
                          Reste
                        </th>
                        <th className="px-3 py-2 text-right w-36">Qté reçue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 font-medium">
                      {activeOrder?.items?.map((item) => {
                        const remaining = getRemainingQty(item);
                        const currentVal = itemQuantities[item.productId] ?? 0;
                        const isFullyReceived = currentVal === remaining && remaining > 0;
                        const isPartial = currentVal > 0 && currentVal < remaining;

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="px-3.5 py-2.5">
                              <p className="font-semibold text-gray-900 dark:text-white leading-tight">
                                {item.productName}
                              </p>
                              <span className="inline-block mt-0.5 rounded bg-gray-100 px-1.5 py-0.2 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {item.sku}
                              </span>
                            </td>
                            <td className="px-2.5 py-2.5 text-center font-mono text-gray-600 dark:text-gray-400 tabular-nums">
                              {item.orderedQuantity}
                            </td>
                            <td className="px-2.5 py-2.5 text-center font-mono text-gray-500 tabular-nums">
                              {item.receivedQuantity || 0}
                            </td>
                            <td className="px-2.5 py-2.5 text-center font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                              {remaining}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={remaining}
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleQuantityChange(item.productId, e.target.value, remaining)
                                  }
                                  disabled={remaining === 0}
                                  className="w-18 rounded-md border border-gray-300 px-2 py-1 text-right font-mono text-xs font-bold text-gray-900 shadow-2xs focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white tabular-nums"
                                />
                                {isFullyReceived && (
                                  <span className="rounded bg-emerald-100 px-1 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    100%
                                  </span>
                                )}
                                {isPartial && (
                                  <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
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

              {/* Total & Footnote */}
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-800/40">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-[11px]">
                  <Info className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>Incrémentation automatique des stocks et clôture du bon.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Total :</span>
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                    {totalUnitsToReceive} unité(s)
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={submitting}
                  className="h-9 px-3 text-xs"
                >
                  ← Précédent
                </Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="h-9 px-3 text-xs">
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || totalUnitsToReceive === 0}
                    className="h-9 px-4 text-xs font-semibold gap-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-2xs"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {submitting ? "Validation..." : "Valider l'Entrée en Stock"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}

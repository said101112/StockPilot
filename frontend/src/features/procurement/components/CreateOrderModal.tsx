import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { procurementApi } from "../api/procurementApi";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import type { PurchaseRequisition } from "../domain/types";
import type { Supplier } from "@/features/suppliers/domain/types";
import type { Product } from "@/features/products/domain/types";
import { ShoppingCart, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requisition: PurchaseRequisition | null;
  product?: Product;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
  requisition,
  product,
}: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("0");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
      if (product) {
        setUnitPrice(product.price.toString());
      }
      if (requisition?.requestedDeliveryDate) {
        setDeliveryDate(requisition.requestedDeliveryDate);
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 5);
        setDeliveryDate(d.toISOString().split("T")[0]);
      }
    }
  }, [isOpen, requisition, product]);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      setError(null);
      const data = await suppliersApi.getAll();
      setSuppliers(data || []);
      if (data && data.length > 0) {
        setSelectedSupplierId(data[0].id);
      }
    } catch {
      setError("Impossible de charger les fournisseurs partenaires.");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requisition) return;

    if (!selectedSupplierId) {
      setError("Veuillez sélectionner un fournisseur.");
      return;
    }

    const priceNum = parseFloat(unitPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Le prix négocié unitaire doit être supérieur à zéro.");
      return;
    }

    if (!deliveryDate) {
      setError("Veuillez spécifier la date prévue de livraison.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await procurementApi.createOrderFromRequisition({
        requisitionId: requisition.id,
        supplierId: selectedSupplierId,
        negotiatedUnitPrice: priceNum,
        expectedDeliveryDate: deliveryDate,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = requisition
    ? (parseFloat(unitPrice) || 0) * requisition.requestedQuantity
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 shrink-0">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Générer le Bon de Commande
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Transformation de la demande validée en commande officielle fournisseur
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {requisition && (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 text-xs dark:border-gray-800 dark:bg-gray-800/40">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Demande Réf: <span className="font-mono">{requisition.prNumber || requisition.requisitionNumber || `DA-${requisition.id.substring(0, 6).toUpperCase()}`}</span>
            </span>
            <span className="rounded-md bg-brand-100 px-2 py-0.5 font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              {requisition.requestedQuantity} PCS
            </span>
          </div>
          {product && (
            <div className="mt-2 text-gray-600 dark:text-gray-400">
              Article : <strong>{product.name}</strong> ({product.sku})
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Fournisseur */}
        <div>
          <Label htmlFor="supplierId" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Fournisseur sélectionné *
          </Label>
          {loadingSuppliers ? (
            <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          ) : (
            <select
              id="supplierId"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="" disabled>Sélectionner un fournisseur...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.paymentTerms || "30 jours"})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Prix Négocié & Date de Livraison */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Prix unitaire négocié (€) *
            </Label>
            <Input
              id="price"
              type="number"
              step={0.01}
              min={0.01}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="expectedDate" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Date prévue de livraison *
            </Label>
            <Input
              id="expectedDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Total estimé */}
        <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3.5 dark:border-brand-900/30 dark:bg-brand-950/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600 dark:text-gray-400">Montant Total de la Commande :</span>
            <span className="text-base font-extrabold text-brand-700 dark:text-brand-300 font-mono">
              {totalAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Création du bon..." : "Créer le Bon de Commande"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

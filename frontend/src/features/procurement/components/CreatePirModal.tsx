import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { pirApi } from "../api/pirApi";
import { productsApi } from "@/features/products/api/productsApi";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import type { PurchasingInfoRecord } from "../domain/types";
import type { Product } from "@/features/products/domain/types";
import type { Supplier } from "@/features/suppliers/domain/types";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Truck,
  Percent,
  Star,
  DollarSign,
  Package,
  Layers,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pir: PurchasingInfoRecord) => void;
  recordToEdit?: PurchasingInfoRecord | null;
}

export default function CreatePirModal({
  isOpen,
  onClose,
  onSuccess,
  recordToEdit,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingLookups, setLoadingLookups] = useState<boolean>(false);

  const [productId, setProductId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [supplierPartNumber, setSupplierPartNumber] = useState<string>("");
  const [baseUnitPrice, setBaseUnitPrice] = useState<string>("0");
  const [currency, setCurrency] = useState<string>("EUR");
  const [leadTimeDays, setLeadTimeDays] = useState<string>("5");
  const [minOrderQuantity, setMinOrderQuantity] = useState<string>("1");
  const [discountTierQuantity, setDiscountTierQuantity] = useState<string>("0");
  const [discountPercentage, setDiscountPercentage] = useState<string>("0");
  const [preferred, setPreferred] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadLookups = async () => {
      try {
        setLoadingLookups(true);
        const [prodList, suppList] = await Promise.all([
          productsApi.getAll().catch(() => []),
          suppliersApi.getAll().catch(() => []),
        ]);
        setProducts(prodList);
        setSuppliers(suppList);

        if (recordToEdit) {
          setProductId(recordToEdit.productId);
          setSupplierId(recordToEdit.supplierId);
          setSupplierPartNumber(recordToEdit.supplierPartNumber || "");
          setBaseUnitPrice(String(recordToEdit.baseUnitPrice));
          setCurrency(recordToEdit.currency || "EUR");
          setLeadTimeDays(String(recordToEdit.leadTimeDays || 5));
          setMinOrderQuantity(String(recordToEdit.minOrderQuantity || 1));
          setDiscountTierQuantity(String(recordToEdit.discountTierQuantity || 0));
          setDiscountPercentage(String(recordToEdit.discountPercentage || 0));
          setPreferred(recordToEdit.preferred || false);
        } else {
          setProductId(prodList.length > 0 ? prodList[0].id : "");
          setSupplierId(suppList.length > 0 ? suppList[0].id : "");
          setSupplierPartNumber("");
          setBaseUnitPrice(prodList.length > 0 ? String(prodList[0].price || 0) : "0");
          setCurrency(suppList.length > 0 ? suppList[0].currency || "EUR" : "EUR");
          setLeadTimeDays("5");
          setMinOrderQuantity("1");
          setDiscountTierQuantity("0");
          setDiscountPercentage("0");
          setPreferred(false);
        }
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
    setError(null);
  }, [isOpen, recordToEdit]);

  const handleProductChange = (prodId: string) => {
    setProductId(prodId);
    const selectedProd = products.find((p) => p.id === prodId);
    if (selectedProd) {
      if (!recordToEdit) {
        setBaseUnitPrice(String(selectedProd.price || 0));
        setSupplierPartNumber(`REF-${selectedProd.sku}`);
      }
    }
  };

  const handleSupplierChange = (suppId: string) => {
    setSupplierId(suppId);
    const selectedSupp = suppliers.find((s) => s.id === suppId);
    if (selectedSupp && selectedSupp.currency) {
      setCurrency(selectedSupp.currency);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !supplierId) {
      setError("Veuillez sélectionner un article et un fournisseur.");
      return;
    }

    const priceNum = parseFloat(baseUnitPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Le prix unitaire doit être un nombre strictement positif.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        productId,
        supplierId,
        supplierPartNumber: supplierPartNumber.trim() || undefined,
        baseUnitPrice: priceNum,
        currency,
        leadTimeDays: parseInt(leadTimeDays, 10) || 5,
        minOrderQuantity: parseInt(minOrderQuantity, 10) || 1,
        discountTierQuantity: parseInt(discountTierQuantity, 10) || 0,
        discountPercentage: parseFloat(discountPercentage) || 0,
        preferred,
      };

      let result: PurchasingInfoRecord;
      if (recordToEdit) {
        result = await pirApi.update(recordToEdit.id, payload);
      } else {
        result = await pirApi.create(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement de la Fiche Info Achat"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl p-6 sm:p-8 rounded-3xl"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {recordToEdit
              ? "Modifier la Fiche Info Achat (PIR)"
              : "Nouvelle Fiche Info Achat (PIR)"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Association Article - Fournisseur, prix négocié et délais d'approvisionnement
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Article & Fournisseur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="productId">Article du Catalogue *</Label>
            <div className="relative mt-1">
              <select
                id="productId"
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                disabled={!!recordToEdit || loadingLookups}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-60"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="supplierId">Fournisseur Habilité *</Label>
            <div className="relative mt-1">
              <select
                id="supplierId"
                value={supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                disabled={!!recordToEdit || loadingLookups}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-60"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.paymentTerms})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ref Fournisseur & Prix Négocié */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <Label htmlFor="supplierPartNumber">Réf. Fournisseur</Label>
            <Input
              id="supplierPartNumber"
              value={supplierPartNumber}
              onChange={(e) => setSupplierPartNumber(e.target.value)}
              placeholder="Ex: CAT-SKU-99"
              className="mt-1 font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="baseUnitPrice">Prix Unitaire HT *</Label>
            <div className="relative mt-1">
              <Input
                id="baseUnitPrice"
                type="number"
                step={0.01}
                min={0.01}
                value={baseUnitPrice}
                onChange={(e) => setBaseUnitPrice(e.target.value)}
                className="pl-8 font-mono text-sm font-bold"
                required
              />
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Devise</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm font-semibold text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="MAD">MAD (DH)</option>
            </select>
          </div>
        </div>

        {/* Lead time & Min Order Qty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="leadTimeDays">Délai Moyen de Livraison (Jours)</Label>
            <div className="relative mt-1">
              <Input
                id="leadTimeDays"
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                className="pl-8 text-sm"
              />
              <Truck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="minOrderQuantity">Quantité Minimale de Commande (MOQ)</Label>
            <div className="relative mt-1">
              <Input
                id="minOrderQuantity"
                type="number"
                min="1"
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(e.target.value)}
                className="pl-8 text-sm"
              />
              <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Remise dégressive par volume */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Tarification Dégressive (Volume)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="discountTierQuantity" className="text-xs">
                Palier Quantité (PCS)
              </Label>
              <Input
                id="discountTierQuantity"
                type="number"
                min="0"
                value={discountTierQuantity}
                onChange={(e) => setDiscountTierQuantity(e.target.value)}
                placeholder="Ex: 50"
                className="mt-1 text-sm bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <Label htmlFor="discountPercentage" className="text-xs">
                Remise accordée (%)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="discountPercentage"
                  type="number"
                  step={0.1}
                  min={0}
                  max={100}
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="Ex: 5.0"
                  className="pl-8 text-sm bg-white dark:bg-gray-800"
                />
                <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Supplier Flag */}
        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={preferred}
              onChange={(e) => setPreferred(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="flex items-center gap-1.5">
              <Star className={`h-4 w-4 ${preferred ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} />
              Fournisseur préférentiel par défaut pour cet article
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Enregistrement..." : recordToEdit ? "Mettre à jour" : "Créer la Fiche PIR"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { productsApi } from "../api/productsApi";
import type { Product } from "../domain/types";
import { Boxes, Barcode, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProduct: Product) => void;
}

export default function CreateProductModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "0",
    currency: "EUR",
    unitOfMeasure: "PCS",
    category: "FINISHED_GOOD",
    initialStock: "0",
    reorderPoint: "10",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generateRandomSku = () => {
    const prefix = formData.category === "FINISHED_GOOD" ? "FG" : formData.category === "RAW_MATERIAL" ? "MP" : "PR";
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setError("La désignation de l'article et le code SKU sont obligatoires.");
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Le prix unitaire doit être un nombre positif ou nul.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await productsApi.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        price: priceNum,
        currency: formData.currency,
        unitOfMeasure: formData.unitOfMeasure,
        category: formData.category,
        initialStock: parseInt(formData.initialStock, 10) || 0,
        reorderPoint: parseInt(formData.reorderPoint, 10) || 10,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        sku: "",
        price: "0",
        currency: "EUR",
        unitOfMeasure: "PCS",
        category: "FINISHED_GOOD",
        initialStock: "0",
        reorderPoint: "10",
      });

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Nouvel Article (Material Master)
          </h3>
          <p className="text-xs text-gray-500">
            Ajout au catalogue des articles et paramétrage des seuils SAP MM
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-xs text-error-700 dark:border-error-900 dark:bg-error-950/30 dark:text-error-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="name">Désignation de l'Article / Nom du Produit *</Label>
          <div className="relative mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Disque de Frein Ventilé, Câble Blindé XLR..."
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sku">Code SKU / Référence Article *</Label>
              <button
                type="button"
                onClick={generateRandomSku}
                className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Générer code
              </button>
            </div>
            <div className="relative mt-1">
              <Input
                id="sku"
                name="sku"
                type="text"
                placeholder="Ex: SKU-AUTO-101"
                value={formData.sku}
                onChange={handleChange}
                required
              />
              <Barcode className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Catégorie Article (SAP MM)</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="FINISHED_GOOD">Produit Fini (FERT)</option>
              <option value="RAW_MATERIAL">Matière Première (ROH)</option>
              <option value="SEMI_FINISHED">Semi-Fini (HALB)</option>
              <option value="SPARE_PART">Pièce de Rechange (ERSA)</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description Technique / Spécifications</Label>
          <textarea
            id="description"
            name="description"
            rows={2}
            placeholder="Détails techniques, tolérances, références fabricant..."
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Prix Unitaire Estimatif *</Label>
            <div className="relative mt-1">
              <Input
                id="price"
                name="price"
                type="number"
                step={0.01}
                min={0}
                value={formData.price}
                onChange={handleChange}
                required
              />
              <DollarSign className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Devise</Label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="MAD">MAD</option>
            </select>
          </div>

          <div>
            <Label htmlFor="unitOfMeasure">Unité de Gestion (UoM)</Label>
            <select
              id="unitOfMeasure"
              name="unitOfMeasure"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="PCS">Pièces (PCS)</option>
              <option value="KG">Kilogrammes (KG)</option>
              <option value="LTR">Litres (LTR)</option>
              <option value="BOX">Boîtes / Cartons (BOX)</option>
              <option value="MTR">Mètres (MTR)</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">
            Initialisation Stock Magasin
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="initialStock">Stock Initial Physique</Label>
              <Input
                id="initialStock"
                name="initialStock"
                type="number"
                min={0}
                value={formData.initialStock}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="reorderPoint">Seuil d'Alerte Réappro (Point de Cde)</Label>
              <Input
                id="reorderPoint"
                name="reorderPoint"
                type="number"
                min={1}
                value={formData.reorderPoint}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Création en cours..." : "Créer l'Article"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

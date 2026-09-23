import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { productsApi } from "../api/productsApi";
import type { Product } from "../domain/types";
import { Edit3, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (updatedProduct: Product) => void;
}

export default function EditProductModal({ isOpen, onClose, product, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0",
    unitOfMeasure: "PCS",
    category: "FINISHED_GOOD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price ? product.price.toString() : "0",
        unitOfMeasure: product.unitOfMeasure || "PCS",
        category: product.category || "FINISHED_GOOD",
      });
      setError(null);
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!formData.name.trim()) {
      setError("Le nom de l'article est obligatoire.");
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
      const updated = await productsApi.update(product.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceNum,
        unitOfMeasure: formData.unitOfMeasure,
        category: formData.category,
      });

      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du produit.");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <Edit3 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Modifier l'Article
          </h3>
          <p className="text-xs text-gray-500">
            Référence SKU : <span className="font-semibold text-gray-700 dark:text-gray-300">{product.sku}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="name">Nom du Produit *</Label>
          <div className="relative mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Disque de Frein Ventilé..."
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Catégorie</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="FINISHED_GOOD">Produit Fini</option>
            <option value="RAW_MATERIAL">Matière Première</option>
            <option value="SEMI_FINISHED">Produit Semi-Fini</option>
            <option value="SPARE_PART">Pièce de Rechange</option>
          </select>
        </div>

        <div>
          <Label htmlFor="description">Description & Spécifications</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Détails techniques, remarques..."
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Prix Unitaire Estimatif ({product.currency || "EUR"}) *</Label>
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
            <Label htmlFor="unitOfMeasure">Unité de Mesure</Label>
            <select
              id="unitOfMeasure"
              name="unitOfMeasure"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="PCS">Pièces</option>
              <option value="KG">Kilogrammes</option>
              <option value="LTR">Litres</option>
              <option value="BOX">Boîtes / Cartons</option>
              <option value="MTR">Mètres</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { productsApi } from "../api/productsApi";
import type { Product } from "../domain/types";
import { Boxes, Barcode, DollarSign, CheckCircle, AlertCircle, Sparkles, Tag } from "lucide-react";
import { PRODUCT_TAXONOMY_GROUPS, PRODUCT_TAXONOMY, getCategoryInfo } from "../domain/taxonomy";

export function generateSkuFromProductName(name: string): string {
  if (!name || !name.trim()) return "";

  // Supprimer les accents et caractères spéciaux
  const clean = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  if (words.length === 1) {
    const w = words[0];
    const prefix = w.length > 5 ? w.substring(0, 5) : w;
    return `${prefix}-001`;
  }

  if (words.length === 2) {
    const w1 = words[0].length > 4 ? words[0].substring(0, 4) : words[0];
    const w2 = words[1].length > 4 ? words[1].substring(0, 4) : words[1];
    return `${w1}-${w2}`;
  }

  // 3 mots ou plus (ex: "Webcam Pro Ultra HD 4K" -> "WEB-PRO-4K")
  const t1 = words[0].substring(0, 3);
  const t2 = words[1].substring(0, 3);
  const last = words[words.length - 1];
  const t3 = /\d/.test(last) ? last.substring(0, 4) : words[2].substring(0, 3);

  return `${t1}-${t2}-${t3}`;
}

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
  const [isSkuCustomized, setIsSkuCustomized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
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
      setIsSkuCustomized(false);
      setError(null);
    }
  }, [isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => {
      const autoSku = !isSkuCustomized ? generateSkuFromProductName(newName) : prev.sku;
      return {
        ...prev,
        name: newName,
        sku: autoSku,
      };
    });
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSkuCustomized(true);
    setFormData((prev) => ({
      ...prev,
      sku: e.target.value.toUpperCase(),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegenerateSku = () => {
    const auto = generateSkuFromProductName(formData.name);
    setFormData((prev) => ({ ...prev, sku: auto }));
    setIsSkuCustomized(false);
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
      setIsSkuCustomized(false);

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
            Nouvel Article
          </h3>
          <p className="text-xs text-gray-500">
            Enregistrement au catalogue et paramétrage des stocks
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
          <Label htmlFor="name">Désignation de l'Article *</Label>
          <div className="relative mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Webcam Pro Ultra HD 4K, Disque SSD..."
              value={formData.name}
              onChange={handleNameChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sku">Référence SKU *</Label>
              <button
                type="button"
                onClick={handleRegenerateSku}
                className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                title="Générer automatiquement la référence d'après le nom"
              >
                <Sparkles className="h-3 w-3" />
                Générer depuis le nom
              </button>
            </div>
            <div className="relative mt-1">
              <Input
                id="sku"
                name="sku"
                type="text"
                placeholder="Ex: WEB-PRO-4K (auto)"
                value={formData.sku}
                onChange={handleSkuChange}
                required
                className="font-mono uppercase font-bold text-teal-700 dark:text-teal-300"
              />
              <Barcode className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            {!isSkuCustomized && formData.sku && (
              <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium">
                <Sparkles className="h-3 w-3 shrink-0" />
                SKU généré automatiquement d'après le nom
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Taxonomie / Catégorie d'Article *</Label>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {PRODUCT_TAXONOMY.length} catégories
              </span>
            </div>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {PRODUCT_TAXONOMY_GROUPS.map((group) => (
                <optgroup key={group} label={`── ${group} ──`}>
                  {PRODUCT_TAXONOMY.filter((c) => c.group === group).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 italic">
              {getCategoryInfo(formData.category).description}
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description & Spécifications</Label>
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

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { productsApi } from "../api/productsApi";
import type { Product } from "../domain/types";
import {
  Boxes,
  Barcode,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Tag,
  Info,
} from "lucide-react";
import { PRODUCT_TAXONOMY, getCategoryInfo } from "../domain/taxonomy";
import CategorySelect from "./CategorySelect";

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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
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
      setCurrentStep(1);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setError("Veuillez renseigner la désignation de l'article.");
      return;
    }
    if (!formData.sku.trim()) {
      setError("Veuillez renseigner ou générer une référence SKU.");
      return;
    }
    setError(null);
    setCurrentStep(2);
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

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-7">
      {/* En-tête avec Stepper */}
      <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 shrink-0">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Nouvel Article Catalogue
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enregistrement au catalogue et paramétrage des stocks
            </p>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              currentStep === 1
                ? "text-brand-600 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                currentStep === 1
                  ? "bg-brand-600 text-white"
                  : "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
              }`}
            >
              1
            </span>
            <span>1. Identification & Taxonomie</span>
          </button>

          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />

          <button
            type="button"
            onClick={() => handleNextStep()}
            className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              currentStep === 2
                ? "text-brand-600 dark:text-brand-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                currentStep === 2
                  ? "bg-brand-600 text-white"
                  : "bg-gray-150 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              2
            </span>
            <span>2. Prix & Initialisation Stock</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={currentStep === 1 ? handleNextStep : handleSubmit} className="mt-4">
        {/* STEP 1: Identification & Taxonomie */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Désignation de l'Article *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex: Webcam Pro Ultra HD 4K, Roulement 608-RS..."
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="sku" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Référence SKU *
                  </Label>
                  <button
                    type="button"
                    onClick={handleRegenerateSku}
                    className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                    title="Générer automatiquement la référence d'après le nom"
                  >
                    <Sparkles className="h-3 w-3" />
                    Générer réf
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="sku"
                    name="sku"
                    type="text"
                    placeholder="Ex: WEB-PRO-4K"
                    value={formData.sku}
                    onChange={handleSkuChange}
                    required
                    className="h-9 font-mono uppercase font-bold text-teal-700 dark:text-teal-300 text-xs sm:text-sm pr-9"
                  />
                  <Barcode className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="category" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Taxonomie / Catégorie *
                  </Label>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {PRODUCT_TAXONOMY.length} catégories
                  </span>
                </div>
                <CategorySelect
                  id="category"
                  value={formData.category}
                  onChange={(newCat) => setFormData((prev) => ({ ...prev, category: newCat }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Description & Spécifications (optionnel)
              </Label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Détails techniques, tolérances, références fabricant..."
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
                Annuler
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-2xs"
              >
                Suivant : Tarifs & Paramètres Stock →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Prix & Initialisation Stock */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Context Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {formData.name}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">
                  {formData.sku}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {getCategoryInfo(formData.category).label}
                </span>
              </div>
            </div>

            {/* Pricing & Units */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <div>
                <Label htmlFor="price" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Prix Unitaire Estimatif *
                </Label>
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
                    className="h-9 text-xs sm:text-sm pr-8 font-mono font-semibold"
                  />
                  <DollarSign className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="currency" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Devise
                </Label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="mt-1 block w-full h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-xs sm:text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="MAD">MAD</option>
                </select>
              </div>

              <div>
                <Label htmlFor="unitOfMeasure" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Unité de Gestion (UoM)
                </Label>
                <select
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  className="mt-1 block w-full h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-xs sm:text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="PCS">Pièces (PCS)</option>
                  <option value="KG">Kilogrammes (KG)</option>
                  <option value="LTR">Litres (LTR)</option>
                  <option value="BOX">Boîtes / Cartons (BOX)</option>
                  <option value="MTR">Mètres (MTR)</option>
                </select>
              </div>
            </div>

            {/* Initialisation Stock */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                Initialisation Stock Magasin
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="initialStock" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Stock Initial Physique
                  </Label>
                  <Input
                    id="initialStock"
                    name="initialStock"
                    type="number"
                    min={0}
                    value={formData.initialStock}
                    onChange={handleChange}
                    className="h-9 text-xs sm:text-sm mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="reorderPoint" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Seuil d'Alerte (Point de Commande)
                  </Label>
                  <Input
                    id="reorderPoint"
                    name="reorderPoint"
                    type="number"
                    min={1}
                    value={formData.reorderPoint}
                    onChange={handleChange}
                    className="h-9 text-xs sm:text-sm mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Note d'information */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <Info className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <span>
                L'enregistrement rendra l'article immédiatement disponible au catalogue et dans les mouvements de stock.
              </span>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
                className="h-9 px-3 text-xs"
              >
                ← Précédent
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9 px-3 text-xs">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-4 text-xs font-semibold gap-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-2xs"
                >
                  <CheckCircle className="h-4 w-4" />
                  {loading ? "Création en cours..." : "Créer l'Article"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

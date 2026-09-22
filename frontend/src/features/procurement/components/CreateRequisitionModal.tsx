import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { procurementApi } from "../api/procurementApi";
import { productsApi } from "@/features/products/api/productsApi";
import { httpClient } from "@/shared/api/httpClient";
import type { Product } from "@/features/products/domain/types";
import { FilePlus2, Package, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProductId?: string;
}

export default function CreateRequisitionModal({
  isOpen,
  onClose,
  onSuccess,
  initialProductId,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || "");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [warehouseName, setWarehouseName] = useState<string>("Entrepôt Central");
  const [requestedQuantity, setRequestedQuantity] = useState<number>(10);
  
  // Date de livraison souhaitée par défaut : J+7
  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<string>(defaultDate());
  const [justification, setJustification] = useState<string>("Réapprovisionnement stock de sécurité");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    }
  }, [initialProductId]);

  const loadInitialData = async () => {
    try {
      setLoadingProducts(true);
      setError(null);

      const [prods, defaultWh] = await Promise.all([
        productsApi.getAll().catch(() => []),
        httpClient.get<{ id: string; name: string }>("/warehouses/default").catch(() => null),
      ]);

      setProducts(prods);

      if (defaultWh?.id) {
        setWarehouseId(defaultWh.id);
        if (defaultWh.name) setWarehouseName(defaultWh.name);
      } else {
        setWarehouseId("48c832a8-a5d4-4d9c-b78a-258bc605c4b9");
        setWarehouseName("Entrepôt Marseille Port");
      }

      if (!selectedProductId && prods.length > 0) {
        setSelectedProductId(prods[0].id);
      }
    } catch {
      setError("Impossible de charger le catalogue d'articles.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      setError("Veuillez sélectionner un article à commander.");
      return;
    }

    if (!requestedQuantity || requestedQuantity <= 0) {
      setError("La quantité demandée doit être supérieure à zéro.");
      return;
    }

    if (!requestedDeliveryDate) {
      setError("Veuillez préciser la date de livraison souhaitée.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await procurementApi.createRequisition({
        productId: selectedProductId,
        warehouseId: warehouseId || "48c832a8-a5d4-4d9c-b78a-258bc605c4b9",
        requestedQuantity: Number(requestedQuantity),
        requestedDeliveryDate,
        justification: justification.trim() || "Demande de réapprovisionnement",
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la demande d'achat");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 shrink-0">
          <FilePlus2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Nouvelle Demande d'Achat
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formulez un besoin de commande auprès du Responsable des Achats
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Choix de l'Article */}
        <div>
          <Label htmlFor="productId" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Article à commander *
          </Label>
          {loadingProducts ? (
            <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          ) : (
            <select
              id="productId"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="" disabled>Sélectionner un article...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Réf: {p.sku} ({p.price} {p.currency || "EUR"})
                </option>
              ))}
            </select>
          )}

          {selectedProduct && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800/60 dark:text-gray-400">
              <Package className="h-4 w-4 text-brand-500 shrink-0" />
              <span>
                <strong>{selectedProduct.name}</strong> • Référence : <span className="font-mono">{selectedProduct.sku}</span> • Unité : {selectedProduct.unitOfMeasure || "PCS"}
              </span>
            </div>
          )}
        </div>

        {/* Quantité & Date Souhaitée */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="quantity" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Quantité demandée *
            </Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                min={1}
                step={1}
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="Ex: 25"
                required
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-gray-400 pointer-events-none">
                {selectedProduct?.unitOfMeasure || "PCS"}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="deliveryDate" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Date souhaitée de livraison *
            </Label>
            <div className="relative">
              <Input
                id="deliveryDate"
                type="date"
                value={requestedDeliveryDate}
                onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Motif / Justification */}
        <div>
          <Label htmlFor="justification" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Motif / Justification du besoin
          </Label>
          <div className="space-y-2">
            <select
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="Réapprovisionnement stock de sécurité">Réapprovisionnement stock de sécurité (Seuil minimum)</option>
              <option value="Besoin urgent pour commande client">Besoin urgent pour commande client</option>
              <option value="Demande atelier de maintenance">Demande atelier de maintenance</option>
              <option value="Remplacement de pièces défectueuses / casse">Remplacement de pièces défectueuses / casse</option>
              <option value="Autre motif">Autre motif (personnalisé)</option>
            </select>

            {justification === "Autre motif" && (
              <Input
                type="text"
                placeholder="Précisez votre justification..."
                onChange={(e) => setJustification(e.target.value)}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Entrepôt de destination */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/40">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Lieu de livraison :</span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">{warehouseName}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Création en cours..." : "Créer la Demande d'Achat"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

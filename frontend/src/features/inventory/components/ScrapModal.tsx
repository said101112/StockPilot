import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { inventoryApi } from "../api/inventoryApi";
import type { InventoryItem, ScrapInventoryResponse } from "../domain/types";

import { Flame } from "lucide-react";

interface ScrapModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem | null;
  onSuccess: (result: ScrapInventoryResponse) => void;
}

export const ScrapModal: React.FC<ScrapModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("Chute accidentelle en rayon — pièce brisée");
  const [operator, setOperator] = useState<string>("Magasinier");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!inventory) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > inventory.availableQuantity) {
      setError(`La quantité doit être comprise entre 1 et ${inventory.availableQuantity}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await inventoryApi.scrapStock(inventory.id, {
        quantity,
        reason,
        operator,
      });
      onSuccess(res);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la déclaration de casse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Déclaration de Casse / Rebut
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sortie de stock immuable — Traçabilité SAP MM 551 (Scrapping)
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Stock Actuel :</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {inventory.quantityOnHand} PCS
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Disponible Réel :</span>
            <p className="font-semibold text-brand-600 dark:text-brand-400">
              {inventory.availableQuantity} PCS
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Seuil Réappro :</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {inventory.reorderPoint} PCS
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Statut :</span>
            <p className="font-semibold text-gray-900 dark:text-white">{inventory.status}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="scrap-quantity">
            Quantité à rebuter <span className="text-error-500">*</span>
          </Label>
          <Input
            id="scrap-quantity"
            type="number"
            min={1}
            max={inventory.availableQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Maximum autorisé : {inventory.availableQuantity} PCS
          </p>
        </div>

        <div>
          <Label htmlFor="scrap-reason">
            Motif de la casse / mise au rebut <span className="text-error-500">*</span>
          </Label>
          <TextArea
            value={reason}
            onChange={(val) => setReason(val)}
            rows={2}
            placeholder="Ex: Chute de palette en travée B3, boîtier plastique fêlé..."
          />
        </div>

        <div>
          <Label htmlFor="scrap-operator">
            Opérateur / Responsable magasin <span className="text-error-500">*</span>
          </Label>
          <Input
            id="scrap-operator"
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            required
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-error-600 hover:bg-error-700 text-white"
            disabled={loading || inventory.availableQuantity <= 0}
          >
            {loading ? "Comptabilisation SAP..." : "Confirmer le Rebut (SAP 551)"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { ScrapModal } from "@/features/inventory/components/ScrapModal";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import type { InventoryItem, ScrapInventoryResponse } from "@/features/inventory/domain/types";

export default function InventoryPage() {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lastScrapResult, setLastScrapResult] = useState<ScrapInventoryResponse | null>(null);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.getAll();
      setInventories(data);
    } catch (err: any) {
      setError(err.message || "Impossible de charger l'inventaire");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const handleOpenScrap = (inv: InventoryItem) => {
    setSelectedInventory(inv);
    setIsModalOpen(true);
  };

  const handleScrapSuccess = (result: ScrapInventoryResponse) => {
    setLastScrapResult(result);
    fetchInventories();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_STOCK":
        return <Badge color="success">EN STOCK</Badge>;
      case "LOW_STOCK":
        return <Badge color="warning">STOCK BAS (≤ Seuil)</Badge>;
      case "OUT_OF_STOCK":
        return <Badge color="error">RUPTURE DE STOCK</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📦 Inventaire & Gestion de Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Suivi des quantités physiques, gestion des seuils d'alerte et déclarations de casse (SAP MM)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchInventories} disabled={loading}>
            🔄 Actualiser
          </Button>
        </div>
      </div>

      {/* Success Notification after Scrap */}
      {lastScrapResult && (
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/20 dark:bg-warning-500/10">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-warning-800 dark:text-warning-300">
                  Mise au Rebut comptabilisée avec succès (SAP 551)
                </h4>
                <p className="text-sm text-warning-700 dark:text-warning-400">
                  Mouvement généré : <strong>{lastScrapResult.movementNumber}</strong> | -
                  {lastScrapResult.quantityScrapped} PCS (Motif : {lastScrapResult.scrapReason})
                </p>
                {lastScrapResult.alertTriggered && (
                  <p className="mt-1 font-medium text-error-600 dark:text-error-400">
                    🚨 Le stock est passé sous le seuil ({lastScrapResult.remainingStock} ≤{" "}
                    {lastScrapResult.reorderPoint} PCS) : Une Alerte de Réapprovisionnement a été
                    automatiquement déclenchée !
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setLastScrapResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">ID Inventaire</th>
                <th className="px-6 py-4">Article (Product ID)</th>
                <th className="px-6 py-4">Entrepôt</th>
                <th className="px-6 py-4 text-center">Stock Physique</th>
                <th className="px-6 py-4 text-center">Réservé</th>
                <th className="px-6 py-4 text-center">Disponible</th>
                <th className="px-6 py-4 text-center">Point de Commande</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions Métier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Chargement de l'inventaire en cours...
                  </td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Aucun article en stock actuellement.
                  </td>
                </tr>
              ) : (
                inventories.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 transition dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {inv.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-900 dark:text-white">
                      {inv.productId.substring(0, 13)}...
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {inv.warehouseId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                      {inv.quantityOnHand} PCS
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {inv.reservedQuantity} PCS
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-brand-600 dark:text-brand-400">
                      {inv.availableQuantity} PCS
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {inv.reorderPoint} PCS
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-error-300 text-error-600 hover:bg-error-50 dark:border-error-700 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => handleOpenScrap(inv)}
                        disabled={inv.availableQuantity <= 0}
                      >
                        💥 Déclarer Rebut (SAP 551)
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scrap Modal */}
      <ScrapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inventory={selectedInventory}
        onSuccess={handleScrapSuccess}
      />
    </div>
  );
}

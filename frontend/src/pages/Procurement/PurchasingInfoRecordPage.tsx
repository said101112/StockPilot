import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { pirApi } from "@/features/procurement/api/pirApi";
import type { PurchasingInfoRecord } from "@/features/procurement/domain/types";
import CreatePirModal from "@/features/procurement/components/CreatePirModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useToast } from "@/shared/context/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import {
  FileSpreadsheet,
  Plus,
  Search,
  RefreshCw,
  Star,
  Truck,
  Building2,
  Boxes,
  Pencil,
  Trash2,
  Layers,
  Percent,
} from "lucide-react";

export default function PurchasingInfoRecordPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "MANAGER");

  const [records, setRecords] = useState<PurchasingInfoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPreferred, setFilterPreferred] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<PurchasingInfoRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<PurchasingInfoRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await pirApi.getAll();
      const sorted = [...(data || [])].sort((a, b) => {
        if (a.preferred !== b.preferred) return a.preferred ? -1 : 1;
        return a.productName.localeCompare(b.productName);
      });
      setRecords(sorted);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    try {
      setDeleteLoading(true);
      await pirApi.delete(recordToDelete.id);
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      showSuccess(`La fiche info achat pour ${recordToDelete.productName} a été supprimée.`);
      setRecordToDelete(null);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erreur lors de la suppression de la fiche.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.supplierPartNumber && r.supplierPartNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPreferred = !filterPreferred || r.preferred;

    return matchesSearch && matchesPreferred;
  });

  const pagination = usePagination({ items: filteredRecords, initialPageSize: 10 });

  const uniqueSuppliersCount = new Set(records.map((r) => r.supplierId)).size;
  const avgLeadTime =
    records.length > 0
      ? Math.round(records.reduce((acc, curr) => acc + (curr.leadTimeDays || 0), 0) / records.length)
      : 0;
  const withTierCount = records.filter((r) => r.discountTierQuantity > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Fiches Info Achat (PIR)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Conditions tarifaires négociées, barèmes dégressifs et délais par fournisseur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadRecords} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          {canManage && (
            <Button
              onClick={() => {
                setRecordToEdit(null);
                setIsModalOpen(true);
              }}
              className="gap-2 bg-brand-600 hover:bg-brand-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Nouvelle Fiche PIR
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Fiches PIR
            </p>
            <Boxes className="h-5 w-5 text-brand-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            {records.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Fournisseurs Partenaires
            </p>
            <Building2 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {uniqueSuppliersCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Tarifs Dégressifs
            </p>
            <Layers className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {withTierCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Délai Moyen d'Appro.
            </p>
            <Truck className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {avgLeadTime} <span className="text-base font-medium text-gray-400">jours</span>
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par article, référence fournisseur, partenaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={filterPreferred}
              onChange={(e) => setFilterPreferred(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Fournisseurs préférentiels uniquement
            </span>
          </label>
          <span className="text-xs font-medium text-gray-400">
            ({filteredRecords.length} fiche(s))
          </span>
        </div>
      </div>

      {/* PIR Records Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-3 sm:px-4 py-3.5">Article & SKU</th>
                <th className="px-3 sm:px-4 py-3.5">Fournisseur Partenaire</th>
                <th className="px-3 sm:px-4 py-3.5">Réf. Fournisseur</th>
                <th className="px-3 sm:px-4 py-3.5">Prix Unitaire Base</th>
                <th className="px-3 sm:px-4 py-3.5 text-center">Délai (Lead Time)</th>
                <th className="px-3 sm:px-4 py-3.5">Tarif Dégressif</th>
                <th className="px-3 sm:px-4 py-3.5 text-center">Préférentiel</th>
                {canManage && <th className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="py-12 text-center text-sm text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des fiches info achat...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="py-12 text-center">
                    <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Aucune fiche info achat trouvée
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm || filterPreferred
                        ? "Modifiez vos filtres de recherche."
                        : "Associez vos articles à vos fournisseurs habilités."}
                    </p>
                    {canManage && !searchTerm && (
                      <Button
                        onClick={() => {
                          setRecordToEdit(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-4 gap-2 bg-brand-600 hover:bg-brand-700 text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Créer une Fiche PIR
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((r) => (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {r.productName}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {r.productSku}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-brand-500 shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {r.supplierName}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3 font-mono text-xs text-gray-500">
                      {r.supplierPartNumber ? (
                        <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800 dark:text-gray-300 font-semibold">
                          {r.supplierPartNumber}
                        </span>
                      ) : (
                        <span className="italic text-gray-400">Non spécifié</span>
                      )}
                    </td>

                    <td className="px-3 sm:px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                      {r.baseUnitPrice?.toFixed(2)} {r.currency || "EUR"}
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <Truck className="h-3 w-3" />
                        {r.leadTimeDays || 5} j
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3">
                      {r.discountTierQuantity > 0 && r.discountPercentage > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <Percent className="h-3.5 w-3.5" />
                          <span>
                            -{r.discountPercentage}% dès {r.discountTierQuantity} PCS
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Prix fixe</span>
                      )}
                    </td>

                    <td className="px-3 sm:px-4 py-3 text-center">
                      {r.preferred ? (
                        <Badge color="warning" size="sm" startIcon={<Star className="h-3 w-3 fill-current" />}>
                          Préférentiel
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {canManage && (
                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setRecordToEdit(r);
                              setIsModalOpen(true);
                            }}
                            title="Modifier cette fiche PIR"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(r)}
                            title="Supprimer cette fiche PIR"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} />
      </div>

      {/* Creation / Edit Modal */}
      <CreatePirModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
        onSuccess={() => {
          loadRecords();
          showSuccess(
            recordToEdit
              ? "Fiche Info Achat mise à jour avec succès."
              : "Nouvelle Fiche Info Achat enregistrée."
          );
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!recordToDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer l'association entre "${recordToDelete?.productName}" et "${recordToDelete?.supplierName}" ?`}
        confirmLabel="Supprimer la fiche"
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
}

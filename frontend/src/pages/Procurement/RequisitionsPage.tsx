import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import type { PurchaseRequisition } from "@/features/procurement/domain/types";
import type { Product } from "@/features/products/domain/types";
import CreateRequisitionModal from "@/features/procurement/components/CreateRequisitionModal";
import CreateOrderModal from "@/features/procurement/components/CreateOrderModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useToast } from "@/shared/context/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { ModernStatusBadge } from "@/components/common/ModernStatusBadge";
import { DateCell } from "@/components/common/DateCell";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import { masterDataCache } from "@/shared/cache/masterDataCache";

export default function RequisitionsPage() {
  const { user } = useAuth();
  const isApprover = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    startIndex,
    endIndex,
    goToPage,
    changePageSize,
  } = usePagination(requisitions, { initialPageSize: 10 });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReqForOrder, setSelectedReqForOrder] = useState<PurchaseRequisition | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [reqToDelete, setReqToDelete] = useState<PurchaseRequisition | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Récupération à la demande avec cache maître pour éviter les requêtes redondantes
      const [reqData, prods] = await Promise.all([
        procurementApi.getRequisitions(),
        masterDataCache.getProducts(),
      ]);

      // Tri strict : Les plus récentes en premier (par date de création puis par N° de DA)
      const sorted = [...(reqData || [])].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.prNumber || b.requisitionNumber || "").localeCompare(
          a.prNumber || a.requisitionNumber || ""
        );
      });
      setRequisitions(sorted);

      const pMap: Record<string, Product> = {};
      prods.forEach((p) => {
        pMap[p.id] = p;
      });
      setProductMap(pMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des Demandes d'Achat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (id: string) => {
    try {
      setActionLoading(id);
      await procurementApi.submitRequisition(id);
      showSuccess("Demande d'achat soumise pour approbation.");
      await fetchData();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erreur lors de la soumission de la demande.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await procurementApi.approveRequisition(id);
      showSuccess("Demande d'achat approuvée avec succès.");
      await fetchData();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erreur lors de la validation de la demande.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reqToDelete) return;
    try {
      setDeleteLoading(true);
      await procurementApi.deleteRequisition(reqToDelete.id);
      showSuccess(`Demande ${reqToDelete.prNumber || reqToDelete.requisitionNumber} supprimée.`);
      setReqToDelete(null);
      await fetchData();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openOrderModal = (req: PurchaseRequisition) => {
    setSelectedReqForOrder(req);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Demandes d'Achat
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expression et validation des besoins de réapprovisionnement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white">
            <Plus className="h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tableau des Demandes d'Achat */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-3 sm:px-4 py-3.5">N° Demande</th>
                <th className="px-3 sm:px-4 py-3.5">Date de Demande</th>
                <th className="px-3 sm:px-4 py-3.5">Article & Référence</th>
                <th className="px-3 sm:px-4 py-3.5 text-center">Quantité Demandée</th>
                <th className="px-3 sm:px-4 py-3.5 text-center">Statut</th>
                <th className="px-3 sm:px-4 py-3.5">Motif / Justification</th>
                <th className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des demandes d'achat...
                  </td>
                </tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <FilePlus className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucune demande d'achat</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Cliquez sur "Nouvelle Demande d'Achat" pour exprimer un besoin de stock.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((req) => {
                  const product = productMap[req.productId];
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                    >
                      <td className="px-3 sm:px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                        {req.prNumber || req.requisitionNumber || `DA-${req.id.substring(0, 6).toUpperCase()}`}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <DateCell date={req.createdAt} updatedDate={req.submittedAt} />
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {product ? product.name : "Article"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            Réf : {product ? product.sku : req.productId.substring(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-center font-bold text-gray-900 dark:text-white font-mono">
                        {req.requestedQuantity} {product?.unitOfMeasure || "PCS"}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <ModernStatusBadge status={req.status} fixedWidth={true} />
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {req.justification || req.notes || "Réapprovisionnement standard"}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === "DRAFT" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSubmit(req.id)}
                                disabled={actionLoading === req.id}
                                title="Transmettre la demande pour validation"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors disabled:opacity-50"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setReqToDelete(req)}
                                title="Supprimer la demande"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {req.status === "SUBMITTED" && (
                            isApprover ? (
                              <button
                                type="button"
                                onClick={() => handleApprove(req.id)}
                                disabled={actionLoading === req.id}
                                title="Valider et approuver la demande (Acheteur/Manager)"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Approuver</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                Validation Achat
                              </span>
                            )
                          )}
                          {req.status === "APPROVED" && (
                            isApprover ? (
                              <button
                                type="button"
                                onClick={() => openOrderModal(req)}
                                title="Générer le Bon de Commande Fournisseur"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                <span>Créer Commande</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                Prêt Commande
                              </span>
                            )
                          )}
                          {req.status === "REJECTED" && (
                            isApprover ? (
                              <button
                                type="button"
                                onClick={() => setReqToDelete(req)}
                                title="Supprimer la demande rejetée"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <span className="text-xs text-rose-500 font-medium">
                                Rejetée
                              </span>
                            )
                          )}
                          {req.status === "ORDERED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                              Commandée
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Contrôles de pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
      </div>

      {/* Modals */}
      <CreateRequisitionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchData();
          showSuccess("Nouvelle demande d'achat créée avec succès.");
        }}
      />

      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={() => {
          fetchData();
          showSuccess("Bon de commande généré avec succès.");
        }}
        requisition={selectedReqForOrder}
        product={selectedReqForOrder ? productMap[selectedReqForOrder.productId] : undefined}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!reqToDelete}
        title="Supprimer la demande d'achat"
        message={`Êtes-vous sûr de vouloir supprimer la demande d'achat "${reqToDelete?.prNumber || reqToDelete?.requisitionNumber}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReqToDelete(null)}
      />
    </div>
  );
}

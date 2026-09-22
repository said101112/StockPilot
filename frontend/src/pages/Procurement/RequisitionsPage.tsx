import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import type { PurchaseRequisition } from "@/features/procurement/domain/types";
import { FileText, RefreshCw, Send, CheckCircle2, AlertCircle, FilePlus } from "lucide-react";

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementApi.getRequisitions();
      setRequisitions(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des Demandes d'Achat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleSubmit = async (id: string) => {
    try {
      setActionLoading(id);
      await procurementApi.submitRequisition(id);
      await fetchRequisitions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la soumission");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await procurementApi.approveRequisition(id);
      await fetchRequisitions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'approbation");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge color="light">BROUILLON (DRAFT)</Badge>;
      case "SUBMITTED":
        return <Badge color="warning">SOUMISE (SUBMITTED)</Badge>;
      case "APPROVED":
        return <Badge color="success">APPROUVÉE (APPROVED)</Badge>;
      case "ORDERED":
        return <Badge color="primary">COMMANDE CRÉÉE (ORDERED)</Badge>;
      case "REJECTED":
        return <Badge color="error">REJETÉE (REJECTED)</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Demandes d'Achat (DA / Purchase Requisition)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expression de besoin magasinier et validation par le Responsable des Achats (Manager)
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={fetchRequisitions} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Demande</th>
                <th className="px-6 py-4">Article (Product ID)</th>
                <th className="px-6 py-4 text-center">Quantité Demandée</th>
                <th className="px-6 py-4">Statut DA</th>
                <th className="px-6 py-4">Justification</th>
                <th className="px-6 py-4 text-right">Actions Acteurs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des demandes d'achat...
                  </td>
                </tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FilePlus className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Aucune demande d'achat</p>
                    <p className="text-xs text-gray-400">Les demandes créées apparaîtront ici.</p>
                  </td>
                </tr>
              ) : (
                requisitions.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {req.requisitionNumber}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {req.productId.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white font-mono">
                      {req.requestedQuantity} PCS
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {req.notes || "Réapprovisionnement standard"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {req.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSubmit(req.id)}
                          disabled={actionLoading === req.id}
                          className="gap-1.5 text-xs text-brand-600 border-brand-300"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Soumettre (Magasinier)
                        </Button>
                      )}
                      {req.status === "SUBMITTED" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoading === req.id}
                          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approuver (Responsable)
                        </Button>
                      )}
                      {req.status === "APPROVED" && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Prête pour PO
                        </span>
                      )}
                      {req.status === "ORDERED" && (
                        <span className="text-xs text-brand-600 font-semibold">
                          PO Déjà Émis
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

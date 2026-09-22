import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import type { PurchaseRequisition } from "@/features/procurement/domain/types";

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
      setRequisitions(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des Demandes d'Achat");
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await procurementApi.approveRequisition(id);
      await fetchRequisitions();
    } catch (err: any) {
      setError(err.message);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📝 Demandes d'Achat (DA / Purchase Requisition)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Expression de besoin magasinier et validation par le Responsable des Achats (Manager)
          </p>
        </div>
        <Button variant="outline" onClick={fetchRequisitions} disabled={loading}>
          🔄 Actualiser
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Demande</th>
                <th className="px-6 py-4">Article (Product ID)</th>
                <th className="px-6 py-4 text-center">Quantité Demandée</th>
                <th className="px-6 py-4">Statut DA</th>
                <th className="px-6 py-4">Justification</th>
                <th className="px-6 py-4 text-right">Actions Acteurs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Chargement des demandes d'achat...
                  </td>
                </tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune demande d'achat enregistrée.
                  </td>
                </tr>
              ) : (
                requisitions.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50/50 transition dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {req.requisitionNumber}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {req.productId.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-brand-600 dark:text-brand-400">
                      {req.requestedQuantity} PCS
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{req.notes || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      {req.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={actionLoading === req.id}
                          onClick={() => handleSubmit(req.id)}
                        >
                          📤 Soumettre (Magasinier)
                        </Button>
                      )}
                      {req.status === "SUBMITTED" && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-success-600 hover:bg-success-700 text-white"
                          disabled={actionLoading === req.id}
                          onClick={() => handleApprove(req.id)}
                        >
                          ✅ Approuver (Manager)
                        </Button>
                      )}
                      {req.status === "APPROVED" && (
                        <span className="text-xs font-semibold text-success-600 dark:text-success-400">
                          Prête pour conversion PO
                        </span>
                      )}
                      {req.status === "ORDERED" && (
                        <span className="text-xs font-semibold text-gray-400">
                          Verrouillée (PO Créé)
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

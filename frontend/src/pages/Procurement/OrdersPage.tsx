import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { procurementApi } from "@/features/procurement/api/procurementApi";
import type { PurchaseOrder } from "@/features/procurement/domain/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementApi.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des Bons de Commande");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleIssue = async (id: string) => {
    try {
      setActionLoading(id);
      await procurementApi.issueOrder(id);
      await fetchOrders();
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
      case "ISSUED":
        return <Badge color="primary">ÉMIS AU FOURNISSEUR (ISSUED)</Badge>;
      case "PARTIALLY_RECEIVED":
        return <Badge color="warning">RÉCEPTION PARTIELLE</Badge>;
      case "COMPLETED":
        return <Badge color="success">LIVRAISON COMPLÈTE</Badge>;
      case "CANCELLED":
        return <Badge color="error">ANNULÉ</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📄 Bons de Commande Fournisseur (PO / Purchase Order)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Engagement juridique d'achat émis auprès du fournisseur qualifié
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
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
                <th className="px-6 py-4">N° Commande (PO)</th>
                <th className="px-6 py-4">Fournisseur ID</th>
                <th className="px-6 py-4 text-center">Articles</th>
                <th className="px-6 py-4 text-center">Montant Total</th>
                <th className="px-6 py-4">Conditions</th>
                <th className="px-6 py-4">Statut Juridique</th>
                <th className="px-6 py-4 text-right">Actions Acheteur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Chargement des commandes...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun bon de commande enregistré.
                  </td>
                </tr>
              ) : (
                orders.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-gray-50/50 transition dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {po.poNumber}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {po.supplierId.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {po.items?.length || 0}
                      </span>{" "}
                      ligne(s)
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-brand-600 dark:text-brand-400">
                      {po.totalAmount?.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {po.currency}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {po.paymentTerms}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(po.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {po.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={actionLoading === po.id}
                          onClick={() => handleIssue(po.id)}
                        >
                          📤 Émettre au Fournisseur
                        </Button>
                      )}
                      {po.status === "ISSUED" && (
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          En attente de livraison (MIGO)
                        </span>
                      )}
                      {po.status === "COMPLETED" && (
                        <span className="text-xs font-semibold text-success-600 dark:text-success-400">
                          ✅ Clôturée (Totalement Reçue)
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

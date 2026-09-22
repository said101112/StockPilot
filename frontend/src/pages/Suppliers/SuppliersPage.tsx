import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import type { Supplier } from "@/features/suppliers/domain/types";
import CreateSupplierModal from "@/features/suppliers/components/CreateSupplierModal";
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersApi.getAll();
      setSuppliers(data || []);
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.taxNumber && s.taxNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPaymentTermBadge = (terms: string) => {
    switch (terms) {
      case "IMMEDIATE":
        return <Badge color="warning">Comptant</Badge>;
      case "NET_30":
        return <Badge color="primary">Net 30 Jours</Badge>;
      case "NET_60":
        return <Badge color="success">Net 60 Jours</Badge>;
      default:
        return <Badge color="light">{terms || "N/A"}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Référentiel Fournisseurs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestion des partenaires d'achat et conditions de règlement (Vendor Master Data)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadSuppliers} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Fournisseur
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Fournisseurs Qualifiés
              </p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                {suppliers.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Conditions Standards (Net 30)
              </p>
              <p className="mt-2 text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                {suppliers.filter((s) => s.paymentTerms === "NET_30").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Paiements Grands Comptes (Net 60)
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {suppliers.filter((s) => s.paymentTerms === "NET_60").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ExternalLink className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par raison sociale, email, TVA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <span className="text-xs font-medium text-gray-500">
          {filteredSuppliers.length} fournisseur(s) affiché(s)
        </span>
      </div>

      {/* Suppliers Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Raison Sociale</th>
                <th className="px-6 py-4">Identifiant Fiscal (TVA)</th>
                <th className="px-6 py-4">Conditions Paiement</th>
                <th className="px-6 py-4">Contact Professionnel</th>
                <th className="px-6 py-4">Localisation</th>
                <th className="px-6 py-4">Devise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des fournisseurs...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Building2 className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Aucun fournisseur trouvé
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? "Aucun résultat pour cette recherche." : "Commencez par ajouter votre premier fournisseur qualifié."}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsModalOpen(true)} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter un Fournisseur
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-bold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                          {supplier.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {supplier.name}
                          </p>
                          <p className="font-mono text-[11px] text-gray-400">
                            ID: {supplier.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {supplier.taxNumber ? (
                        <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {supplier.taxNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Non renseigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentTermBadge(supplier.paymentTerms)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <a
                            href={`mailto:${supplier.email}`}
                            className="text-brand-600 hover:underline dark:text-brand-400"
                          >
                            {supplier.email}
                          </a>
                        </div>
                        {supplier.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            <span>{supplier.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {supplier.address || "Non renseignée"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color="light">{supplier.currency || "EUR"}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <CreateSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          setSuppliers((prev) => [created, ...prev]);
        }}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { productsApi } from "@/features/products/api/productsApi";
import type { Product } from "@/features/products/domain/types";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import {
  Boxes,
  Plus,
  Search,
  RefreshCw,
  Barcode,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "ALL" || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "FINISHED_GOOD":
        return <Badge color="success">Produit Fini (FERT)</Badge>;
      case "RAW_MATERIAL":
        return <Badge color="primary">Matière Première (ROH)</Badge>;
      case "SEMI_FINISHED":
        return <Badge color="warning">Semi-Fini (HALB)</Badge>;
      case "SPARE_PART":
        return <Badge color="error">Pièce Rechange (ERSA)</Badge>;
      default:
        return <Badge color="light">{cat || "Général"}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Catalogue Articles
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Référentiel des articles, spécifications et fiches matières (Material Master SAP MM)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadProducts} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvel Article
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Articles Enregistrés
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            {products.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Produits Finis (FERT)
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {products.filter((p) => p.category === "FINISHED_GOOD").length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Matières Premières (ROH)
          </p>
          <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {products.filter((p) => p.category === "RAW_MATERIAL").length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Pièces Rechange (ERSA)
          </p>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {products.filter((p) => p.category === "SPARE_PART").length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par référence SKU, nom d'article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Catégorie:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="FINISHED_GOOD">Produits Finis</option>
            <option value="RAW_MATERIAL">Matières Premières</option>
            <option value="SEMI_FINISHED">Semi-Finis</option>
            <option value="SPARE_PART">Pièces Rechange</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Référence SKU</th>
                <th className="px-6 py-4">Désignation de l'Article</th>
                <th className="px-6 py-4">Catégorie SAP</th>
                <th className="px-6 py-4">Prix Unitaire Estimé</th>
                <th className="px-6 py-4">Unité (UoM)</th>
                <th className="px-6 py-4">Identifiant Système</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des articles...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Boxes className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Aucun article trouvé
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm || categoryFilter !== "ALL"
                        ? "Modifiez vos filtres de recherche."
                        : "Commencez par ajouter votre premier article au catalogue."}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsModalOpen(true)} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter un Article
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {product.sku}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-[280px]">
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(product.category)}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {product.price.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {product.currency || "EUR"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {product.unitOfMeasure || "PCS"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {product.id.substring(0, 13)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          setProducts((prev) => [created, ...prev]);
        }}
      />
    </div>
  );
}

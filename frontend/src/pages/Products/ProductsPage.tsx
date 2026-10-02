import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { productsApi } from "@/features/products/api/productsApi";
import { masterDataCache } from "@/shared/cache/masterDataCache";
import type { Product } from "@/features/products/domain/types";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import EditProductModal from "@/features/products/components/EditProductModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useToast } from "@/shared/context/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import { PRODUCT_TAXONOMY_GROUPS, PRODUCT_TAXONOMY, getCategoryInfo } from "@/features/products/domain/taxonomy";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import {
  Boxes,
  Plus,
  Search,
  RefreshCw,
  Barcode,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ProductsPage() {
  const { hasRole } = useAuth();
  const canManageProducts = hasRole("ADMIN");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit and Delete state
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await masterDataCache.getProducts(forceRefresh);
      // Le plus récent en haut (les nouveaux articles créés apparaissent en première ligne)
      const sorted = [...(data || [])].reverse();
      setProducts(sorted);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setDeleteLoading(true);
      await productsApi.delete(productToDelete.id);
      masterDataCache.invalidate("products");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showSuccess(`L'article "${productToDelete.name}" a été supprimé.`);
      setProductToDelete(null);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'article.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "ALL" || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const pagination = usePagination({ items: filteredProducts, initialPageSize: 10 });

  const getCategoryBadge = (cat: string) => {
    const info = getCategoryInfo(cat);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${info.badgeClass}`}
        title={`${info.group} : ${info.description}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        {info.label}
      </span>
    );
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
              Référentiel des articles et spécifications techniques (taxonomie multi-catégories)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadProducts} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          {canManageProducts && (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel Article
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Articles
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            {products.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Produits Finis
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {products.filter((p) => p.category === "FINISHED_GOOD").length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Intrants & Fabrication
          </p>
          <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {products.filter((p) => p.category === "RAW_MATERIAL" || p.category === "SEMI_FINISHED").length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MRO, Équipements & Support
          </p>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {products.filter((p) => p.category !== "FINISHED_GOOD" && p.category !== "RAW_MATERIAL" && p.category !== "SEMI_FINISHED").length}
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
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Taxonomie:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="ALL">Toutes les catégories ({products.length})</option>
            {PRODUCT_TAXONOMY_GROUPS.map((group) => (
              <optgroup key={group} label={`── ${group} ──`}>
                {PRODUCT_TAXONOMY.filter((c) => c.group === group).map((c) => {
                  const count = products.filter((p) => p.category === c.code).length;
                  return (
                    <option key={c.code} value={c.code}>
                      {c.label} ({count})
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-3 sm:px-4 py-3.5">Référence SKU</th>
                <th className="px-3 sm:px-4 py-3.5">Désignation</th>
                <th className="px-3 sm:px-4 py-3.5">Catégorie</th>
                <th className="px-3 sm:px-4 py-3.5">Prix Unitaire</th>
                <th className="px-3 sm:px-4 py-3.5">Unité</th>
                {canManageProducts && <th className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={canManageProducts ? 6 : 5} className="py-12 text-center text-sm text-gray-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Chargement des articles...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={canManageProducts ? 6 : 5} className="py-12 text-center">
                    <Boxes className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Aucun article trouvé
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm || categoryFilter !== "ALL"
                        ? "Modifiez vos filtres de recherche."
                        : canManageProducts
                        ? "Commencez par ajouter votre premier article au catalogue."
                        : "Aucun article disponible dans le catalogue."}
                    </p>
                    {!searchTerm && canManageProducts && (
                      <Button onClick={() => setIsModalOpen(true)} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter un Article
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {product.sku}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-[240px]">
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      {getCategoryBadge(product.category)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                      {product.price.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {product.currency || "EUR"}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {product.unitOfMeasure || "PCS"}
                      </span>
                    </td>
                    {canManageProducts && (
                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setProductToEdit(product)}
                            title="Modifier cet article"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            title="Supprimer cet article"
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

      {/* Creation Modal */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          masterDataCache.invalidate("products");
          setProducts((prev) => [created, ...prev]);
          showSuccess(`L'article "${created.name}" a été créé avec succès.`);
        }}
      />

      {/* Edit Modal */}
      <EditProductModal
        isOpen={!!productToEdit}
        onClose={() => setProductToEdit(null)}
        product={productToEdit}
        onSuccess={(updated) => {
          masterDataCache.invalidate("products");
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          showSuccess(`L'article "${updated.name}" a été mis à jour avec succès.`);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer définitivement l'article "${productToDelete?.name}" (${productToDelete?.sku}) ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

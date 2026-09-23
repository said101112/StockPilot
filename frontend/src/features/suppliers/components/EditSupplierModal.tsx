import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { suppliersApi } from "../api/suppliersApi";
import type { Supplier } from "../domain/types";
import { Edit3, Mail, Phone, MapPin, Receipt, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSuccess: (updatedSupplier: Supplier) => void;
}

export default function EditSupplierModal({ isOpen, onClose, supplier, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    taxNumber: "",
    paymentTerms: "NET_30",
    currency: "EUR",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phoneNumber: supplier.phoneNumber || "",
        address: supplier.address || "",
        taxNumber: supplier.taxNumber || "",
        paymentTerms: supplier.paymentTerms || "NET_30",
        currency: supplier.currency || "EUR",
        status: supplier.status || "ACTIVE",
      });
      setError(null);
    }
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Le nom de l'entreprise et l'email sont obligatoires.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await suppliersApi.update(supplier.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        taxNumber: formData.taxNumber.trim(),
        paymentTerms: formData.paymentTerms,
        currency: formData.currency,
        status: formData.status,
      });

      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du fournisseur.");
    } finally {
      setLoading(false);
    }
  };

  if (!supplier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <Edit3 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Modifier le Fournisseur
          </h3>
          <p className="text-xs text-gray-500">
            Fiche fournisseur : <span className="font-semibold text-gray-700 dark:text-gray-300">{supplier.name}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="name">Raison Sociale / Nom *</Label>
          <div className="relative mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Siemens France SAS..."
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Email Contact Professionnel *</Label>
            <div className="relative mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@fournisseur.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="phoneNumber">Téléphone</Label>
            <div className="relative mt-1">
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                placeholder="+33 1 23 45 67 89"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <Phone className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="taxNumber">Numéro de TVA</Label>
            <div className="relative mt-1">
              <Input
                id="taxNumber"
                name="taxNumber"
                type="text"
                placeholder="FR-TVA-99887766"
                value={formData.taxNumber}
                onChange={handleChange}
              />
              <Receipt className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Adresse / Siège Social</Label>
            <div className="relative mt-1">
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="15 Rue de l'Industrie, Paris"
                value={formData.address}
                onChange={handleChange}
              />
              <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="paymentTerms">Conditions de Règlement</Label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="IMMEDIATE">Comptant</option>
              <option value="NET_30">30 Jours</option>
              <option value="NET_60">60 Jours</option>
              <option value="CASH">Espèces / Chèque</option>
            </select>
          </div>

          <div>
            <Label htmlFor="currency">Devise</Label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="MAD">MAD</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

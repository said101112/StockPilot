import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { suppliersApi } from "../api/suppliersApi";
import type { Supplier } from "../domain/types";
import { Building2, Mail, Phone, MapPin, Receipt, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSupplier: Supplier) => void;
}

export default function CreateSupplierModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    taxNumber: "",
    paymentTerms: "NET_30",
    currency: "EUR",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Le nom de l'entreprise et l'adresse email sont obligatoires.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await suppliersApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        taxNumber: formData.taxNumber.trim(),
        paymentTerms: formData.paymentTerms,
        currency: formData.currency,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        taxNumber: "",
        paymentTerms: "NET_30",
        currency: "EUR",
      });

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du fournisseur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Nouveau Fournisseur
          </h3>
          <p className="text-xs text-gray-500">
            Création d'une fiche fournisseur au référentiel achats (Vendor Master)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-xs text-error-700 dark:border-error-900 dark:bg-error-950/30 dark:text-error-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="name">Raison Sociale / Nom de l'entreprise *</Label>
          <div className="relative mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Siemens France SAS, Bosch Logistics..."
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
            <Label htmlFor="taxNumber">Numéro de TVA Intracommunautaire</Label>
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
            <Label htmlFor="address">Siège Social / Adresse</Label>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="paymentTerms">Conditions de Règlement (Payment Terms)</Label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="IMMEDIATE">Paiement Immédiat (Comptant)</option>
              <option value="NET_30">Net 30 Jours (Standard)</option>
              <option value="NET_60">Net 60 Jours (Grand Compte)</option>
              <option value="CASH">Espèces / Chèque</option>
            </select>
          </div>

          <div>
            <Label htmlFor="currency">Devise Transactionnelle</Label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="EUR">EUR (€) - Euro</option>
              <option value="USD">USD ($) - Dollar US</option>
              <option value="GBP">GBP (£) - Livre Sterling</option>
              <option value="MAD">MAD - Dirham Marocain</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Création en cours..." : "Enregistrer le Fournisseur"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

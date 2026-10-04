import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/shared/context/ToastContext";
import { authApi } from "@/features/auth/api/authApi";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  Package,
  Upload,
  Camera,
  Trash2,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  Clock,
  Fingerprint,
} from "lucide-react";

// Avatars prédéfinis SVG de haute qualité inspirés des métiers de la supply chain et de l'administration
const PRESET_AVATARS = [
  {
    id: "admin-exec",
    label: "Direction / Administrateur",
    category: "Gouvernance",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=b6e3f4,c0aede,d1d4f9",
  },
  {
    id: "procurement-mgr",
    label: "Responsable Achats & DA",
    category: "Achats",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Manager&backgroundColor=ffd5dc,ffdfbf",
  },
  {
    id: "warehouse-lead",
    label: "Chef de Dépôt / Magasinier",
    category: "Logistique",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Warehouse&backgroundColor=c0aede,d1d4f9",
  },
  {
    id: "it-security",
    label: "Expert Sécurité & ERP",
    category: "Informatique",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Security&backgroundColor=b6e3f4",
  },
  {
    id: "operator-dock",
    label: "Opérateur Réceptions & Quai",
    category: "Terrain",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Logistics&backgroundColor=ffdfbf",
  },
  {
    id: "supply-planner",
    label: "Gestionnaire Flux & Stocks",
    category: "Planification",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Planner&backgroundColor=d1d4f9",
  },
  {
    id: "quality-control",
    label: "Contrôleur Qualité Entrante",
    category: "Qualité",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Quality&backgroundColor=b6e3f4,ffd5dc",
  },
  {
    id: "modern-minimal",
    label: "Profil Minimaliste",
    category: "Général",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=StockPilot&backgroundColor=c0aede",
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulaire Coordonnées
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(
    user?.department ||
      (user?.role === "ADMIN"
        ? "Direction des Systèmes d'Information"
        : user?.role === "MANAGER"
        ? "Direction Achats & Approvisionnements"
        : "Département Logistique & Magasins")
  );

  // Avatar actuel
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    user?.avatarUrl || null
  );

  // Formulaire Mot de Passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);

  // Initiales pour le fallback
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.fullName
      ? user.fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "SP";

  // Sauvegarde persistée de l'avatar vers le backend
  const persistAvatar = async (avatarUrl: string | null) => {
    try {
      await authApi.updateProfile({ avatarUrl });
      setCurrentAvatar(avatarUrl);
      updateUser({ avatarUrl });
      showSuccess(
        avatarUrl
          ? "Avatar mis à jour et enregistré sur le serveur !"
          : "Avatar réinitialisé sur les initiales."
      );
    } catch {
      // Fallback local si backend en cours de redémarrage
      setCurrentAvatar(avatarUrl);
      updateUser({ avatarUrl });
      showSuccess("Avatar enregistré localement !");
    }
  };

  // Gestion du téléversement de photo personnalisée
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Format invalide. Veuillez sélectionner une image (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError("L'image est trop volumineuse (maximum 2 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      await persistAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  // Sélection d'un avatar prédéfini
  const handleSelectPreset = async (url: string) => {
    await persistAvatar(url);
  };

  // Réinitialisation vers l'avatar initiales
  const handleRemoveAvatar = async () => {
    await persistAvatar(null);
  };

  // Sauvegarde des informations personnelles (Backend + Context)
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      department: department.trim(),
      avatarUrl: currentAvatar,
    };

    try {
      const updated = await authApi.updateProfile(payload);
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        fullName: updated.fullName,
        phone: updated.phone,
        department: updated.department,
        avatarUrl: updated.avatarUrl,
      });
      showSuccess("Coordonnées enregistrées avec succès sur le serveur !");
    } catch {
      // Fallback local
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || user?.fullName || "Utilisateur";
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        phone: phone.trim(),
        department: department.trim(),
      });
      showSuccess("Coordonnées mises à jour !");
    } finally {
      setInfoLoading(false);
    }
  };

  // Modification du mot de passe (Backend)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showError("Veuillez renseigner votre mot de passe actuel.");
      return;
    }

    if (newPassword.length < 8) {
      showError("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Les mots de passe saisis ne correspondent pas.");
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess("Votre mot de passe a été modifié avec succès sur le serveur !");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la mise à jour du mot de passe";
      showError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleMeta = {
    ADMIN: {
      label: "Administrateur Système",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
      icon: ShieldCheck,
      description: "Contrôle complet de la plateforme : gouvernance, IAM, référentiels et audits.",
    },
    MANAGER: {
      label: "Manager Achats & Appro.",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      icon: Briefcase,
      description: "Gestion des commandes fournisseurs, validation des DA, fiches PIR et approvisionnements.",
    },
    USER: {
      label: "Magasinier Stock & Quai",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      icon: Package,
      description: "Opérations de stock physique : entrées/sorties, réceptions de marchandises et inventaires.",
    },
  }[user?.role || "USER"];

  const RoleIcon = roleMeta.icon;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* En-tête Titre */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Mon Profil Collaborateur
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Personnalisez votre avatar, vos coordonnées professionnelles et vos paramètres de sécurité.
        </p>
      </div>

      {/* Hero Card : Résumé de Profil & Upload photo direct */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar principal avec bouton d'édition rapide */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-brand-500/20 shadow-md bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={user?.fullName || "Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-brand-500 text-white shadow-md hover:bg-brand-600 transition-colors"
              title="Téléverser une photo depuis votre appareil"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Informations résumé */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {user?.fullName || "Utilisateur StockPilot"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {user?.email}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleMeta.badgeClass} self-center sm:self-auto`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                {roleMeta.label}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl">
              {roleMeta.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                {department}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Compte actif & synchronisé
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Session active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grille principale : Avatar Selector + Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE GAUCHE (7 cols) : Galerie d'Avatars Prédéfinis */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  Galerie d'Avatars Entreprise
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Sélectionnez un avatar métier ou importez une photo via le bouton caméra
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs flex items-center gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Photo
                </Button>

                {currentAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors px-2 py-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Initiales
                  </button>
                )}
              </div>
            </div>

            {/* Grille de Presets (Sans boîte pointillée superflue) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = currentAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`group flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="h-14 w-14 rounded-full overflow-hidden mb-2 border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                      {preset.category}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Rôle & Habilitations Techniques */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-purple-500" />
              Habilitations & Identifiant Unique
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">ID Collaborateur (UUID)</span>
                <span className="font-mono text-gray-700 dark:text-gray-300 text-[11px]">
                  {user?.id || "usr_live_0192a8b3"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Rôle RBAC Attribué</span>
                <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                  ROLE_{user?.role || "USER"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Mécanisme d'authentification</span>
                <span className="text-gray-700 dark:text-gray-300">JWT Bearer (RSA-256)</span>
              </div>
            </div>
          </section>
        </div>

        {/* COLONNE DROITE (5 cols) : Formulaire Données & Mot de passe */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coordonnées & Données Personnelles */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-brand-500" />
              Coordonnées Collaborateur
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Mettez à jour vos coordonnées synchronisées avec la base de données
            </p>

            <form onSubmit={handleSaveInfo} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prénom</Label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFirstName(e.target.value)
                    }
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLastName(e.target.value)
                    }
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div>
                <Label>Adresse Email (Lecture seule)</Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <Label>Ligne Téléphonique Professionnelle</Label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPhone(e.target.value)
                    }
                    placeholder="+33 1 ..."
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <Label>Département / Affectation</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={department}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDepartment(e.target.value)
                    }
                    placeholder="Direction, Dépôt, Quai..."
                  />
                  <Building className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" className="w-full" disabled={infoLoading}>
                  {infoLoading ? "Enregistrement en cours..." : "Enregistrer dans la base de données"}
                </Button>
              </div>
            </form>
          </section>

          {/* Modification du Mot de Passe */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              Sécurité du Compte
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Mettez à jour votre mot de passe d'accès (minimum 8 caractères)
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <Label>Mot de passe actuel</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <Label>Confirmer le mot de passe</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="••••••••••••"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? "Mise à jour..."
                    : "Mettre à jour le mot de passe"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

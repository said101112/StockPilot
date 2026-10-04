import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { usersApi } from '../api/usersApi';
import type { UserItem } from '../domain/types';
import type { Role } from '@/features/auth/domain/types';
import {
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Package,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/shared/context/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: UserItem) => void;
}

const ROLE_OPTIONS: {
  role: Role;
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    role: 'USER',
    title: 'Magasinier Stock',
    badge: 'Logistique',
    icon: <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    description: 'Entrées quai (BL), sorties, inventaires et déclarations de casse.',
  },
  {
    role: 'MANAGER',
    title: 'Manager Achats',
    badge: 'Approvisionnements',
    icon: <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    description: 'Validation des DA, émission des bons PO et négociations PIR.',
  },
  {
    role: 'ADMIN',
    title: 'Administrateur',
    badge: 'Accès Total',
    icon: <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    description: 'Gouvernance globale, gestion des référentiels et habilitations.',
  },
];

export default function CreateUserModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER' as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }
    if (!form.email.trim()) {
      setError("L'adresse email professionnelle est obligatoire.");
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await usersApi.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      showSuccess(`Utilisateur ${created.fullName} (${created.email}) créé avec succès.`);
      onSuccess(created);
      onClose();
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'USER',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur.";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-7">
      <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 shrink-0">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Créer un Compte Collaborateur
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Provisioning interne et attribution des droits opérationnels
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Prénom & Nom */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Prénom *
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="ex: Jean"
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              required
              className="h-9 text-xs sm:text-sm mt-1"
            />
          </div>

          <div>
            <Label htmlFor="lastName" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nom *
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="ex: Dupont"
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              required
              className="h-9 text-xs sm:text-sm mt-1"
            />
          </div>
        </div>

        {/* Email Professionnel */}
        <div>
          <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Adresse Email Professionnelle *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="ex: j.dupont@stockpilot.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            className="h-9 text-xs sm:text-sm mt-1"
          />
        </div>

        {/* Rôle Attribué */}
        <div>
          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
            Rôle & Périmètre de Droits *
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = form.role === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: opt.role }))}
                  className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/30'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {opt.icon}
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {opt.title}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mot de Passe Initial */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Mot de Passe Initial *
            </Label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Générer un mot de passe
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 caractères"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              className="h-9 text-xs sm:text-sm font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9 text-xs">
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-9 px-4 text-xs font-semibold gap-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-2xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Création...' : "Créer l'Utilisateur"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

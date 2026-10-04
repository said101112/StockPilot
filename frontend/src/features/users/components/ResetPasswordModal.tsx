import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { usersApi } from '../api/usersApi';
import type { UserItem } from '../domain/types';
import { KeyRound, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/shared/context/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onSuccess: () => void;
}

export default function ResetPasswordModal({ isOpen, onClose, user, onSuccess }: Props) {
  const [newPassword, setNewPassword] = useState('');
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
    setNewPassword(pwd);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await usersApi.resetPassword(user.id, { newPassword });
      showSuccess(`Mot de passe réinitialisé pour ${user.fullName}.`);
      onSuccess();
      onClose();
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="border-b border-gray-100 pb-3.5 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              Réinitialiser le Mot de Passe
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Utilisateur : <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.fullName}</span>
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
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="resetPassword" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nouveau Mot de Passe *
            </Label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Générer
            </button>
          </div>
          <div className="relative">
            <Input
              id="resetPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9 text-xs">
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || newPassword.length < 6}
            className="h-9 px-4 text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Application...' : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

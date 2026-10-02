import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';
import Button from '@/components/ui/button/Button';

export default function Forbidden() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Administrateur'
      : user?.role === 'MANAGER'
      ? 'Manager Achats'
      : 'Magasinier / Opérateur Stock';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-center">
      <div className="relative max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80">
        {/* Glow & Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400">
          <ShieldAlert className="h-10 w-10" />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm">
            <Lock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300 mb-3">
          Erreur 403 • Accès Refusé
        </span>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Zone Protégée par Rôle
        </h1>

        <p className="mt-2.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Vous êtes actuellement connecté en tant que{' '}
          <strong className="text-gray-800 dark:text-gray-200">
            {user?.fullName || user?.email || 'Utilisateur'} ({roleLabel})
          </strong>
          . Cette section requiert des privilèges d'approvisionnement ou d'administration supérieurs.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full gap-2 justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Page précédente
          </Button>

          <Link to="/" className="w-full">
            <Button className="w-full gap-2 justify-center">
              <LayoutDashboard className="w-4 h-4" />
              Tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

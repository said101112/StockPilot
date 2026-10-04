import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/shared/context/ToastContext';
import { usersApi } from '@/features/users/api/usersApi';
import type { UserItem } from '@/features/users/domain/types';
import type { Role } from '@/features/auth/domain/types';
import CreateUserModal from '@/features/users/components/CreateUserModal';
import ResetPasswordModal from '@/features/users/components/ResetPasswordModal';
import Button from '@/components/ui/button/Button';
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  KeyRound,
  UserCheck,
  UserX,
  Package,
  Briefcase,
  ShieldCheck,
  Filter,
} from 'lucide-react';

const ROLE_BADGES: Record<
  Role,
  { label: string; badgeClass: string; icon: React.ReactNode; bgGradient: string }
> = {
  ADMIN: {
    label: 'Administrateur',
    badgeClass:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    icon: <ShieldCheck className="h-3 w-3" />,
    bgGradient: 'from-purple-600 to-indigo-600',
  },
  MANAGER: {
    label: 'Manager Achats',
    badgeClass:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: <Briefcase className="h-3 w-3" />,
    bgGradient: 'from-blue-600 to-cyan-600',
  },
  USER: {
    label: 'Magasinier Stock',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: <Package className="h-3 w-3" />,
    bgGradient: 'from-emerald-600 to-teal-600',
  },
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | Role>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState<UserItem | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible de charger les utilisateurs.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (targetUser: UserItem) => {
    if (targetUser.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
      showError('Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }

    try {
      const updated = await usersApi.toggleStatus(targetUser.id);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
      showSuccess(
        `Le compte de ${targetUser.fullName} est désormais ${
          updated.enabled ? 'activé' : 'désactivé'
        }.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de statut.';
      showError(msg);
    }
  };

  const handleChangeRole = async (targetUser: UserItem, newRole: Role) => {
    if (targetUser.email.toLowerCase() === currentUser?.email?.toLowerCase() && newRole !== 'ADMIN') {
      showError('Vous ne pouvez pas rétrograder votre propre compte administrateur.');
      return;
    }

    try {
      const updated = await usersApi.updateRole(targetUser.id, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
      showSuccess(`Rôle de ${targetUser.fullName} mis à jour : ${ROLE_BADGES[newRole].label}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de rôle.';
      showError(msg);
    }
  };

  const handleOpenResetPassword = (targetUser: UserItem) => {
    setUserForPasswordReset(targetUser);
    setIsResetModalOpen(true);
  };

  // KPI Calculations
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const managerCount = users.filter((u) => u.role === 'MANAGER').length;
  const warehouseCount = users.filter((u) => u.role === 'USER').length;

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && u.enabled) ||
        (selectedStatus === 'INACTIVE' && !u.enabled);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, selectedRole, selectedStatus]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestion des Utilisateurs & Habilitations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Provisioning interne, attribution des rôles et contrôle des accès
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
            startIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
            className="h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-2xs"
          >
            Actualiser
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            startIcon={<UserPlus className="h-3.5 w-3.5" />}
            className="h-9 px-3.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-2xs transition-colors"
          >
            Nouvel Utilisateur
          </Button>
        </div>
      </div>

      {/* 2. HORIZONTAL KPI ROW */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Utilisateurs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Utilisateurs
            </span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">comptes</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Collaborateurs habilités au système
          </p>
        </div>

        {/* Magasiniers (USER) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Magasiniers Stock
            </span>
            <Package className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {warehouseCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">opérateurs</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Gestion physique quai & inventaires
          </p>
        </div>

        {/* Managers Achats (MANAGER) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Managers Achats
            </span>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {managerCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">acheteurs</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Validation DA, bons PO & tarifs PIR
          </p>
        </div>

        {/* Administrateurs (ADMIN) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Administrateurs
            </span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-purple-700 dark:text-purple-400 tabular-nums">
              {adminCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">super-admins</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            Gouvernance et gestion des accès
          </p>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filtres :</span>
          </div>

          {/* Rôle select */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as 'ALL' | Role)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="USER">Magasiniers</option>
            <option value="MANAGER">Managers Achats</option>
            <option value="ADMIN">Administrateurs</option>
          </select>

          {/* Statut select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Comptes Actifs</option>
            <option value="INACTIVE">Comptes Désactivés</option>
          </select>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-800/40">
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-3">Rôle Système</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3">Création</th>
                <th className="py-3 pr-4 text-right">Actions Habilitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    Aucun utilisateur ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleConfig = ROLE_BADGES[u.role] || ROLE_BADGES.USER;
                  const initials =
                    (u.firstName?.[0] || '') + (u.lastName?.[0] || '') ||
                    u.email.substring(0, 2).toUpperCase();
                  const isCurrent =
                    u.email.toLowerCase() === currentUser?.email?.toLowerCase();

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Avatar & Identité */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white text-xs bg-gradient-to-tr border border-slate-200 dark:border-slate-700 ${roleConfig.bgGradient}`}
                          >
                            {isCurrent && currentUser?.avatarUrl ? (
                              <img src={currentUser.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                            ) : u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                            ) : (
                              initials
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white truncate">
                                {u.fullName}
                              </span>
                              {isCurrent && (
                                <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                                  Vous
                                </span>
                              )}
                            </div>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rôle selector */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${roleConfig.badgeClass}`}
                          >
                            {roleConfig.icon}
                            {roleConfig.label}
                          </span>
                        </div>
                      </td>

                      {/* Statut (Actif / Désactivé) */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.enabled
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.enabled ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {u.enabled ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>

                      {/* Date de création */}
                      <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Initialisé'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Changer le rôle */}
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u, e.target.value as Role)}
                            disabled={isCurrent}
                            title={isCurrent ? 'Vous ne pouvez pas modifier votre propre rôle' : 'Modifier le rôle'}
                            className="h-7 rounded border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <option value="USER">Magasinier</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>

                          {/* Réinitialiser mot de passe */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPassword(u)}
                            title="Réinitialiser le mot de passe"
                            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          {/* Activer / Désactiver */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Vous ne pouvez pas désactiver votre propre compte'
                                : u.enabled
                                ? 'Désactiver le compte'
                                : 'Activer le compte'
                            }
                            className={`flex h-7 w-7 items-center justify-center rounded border transition-colors disabled:opacity-50 ${
                              u.enabled
                                ? 'border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}
                          >
                            {u.enabled ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Créer Utilisateur */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newUser) => {
          setUsers((prev) => [newUser, ...prev]);
        }}
      />

      {/* Modal Réinitialiser Mot de Passe */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setUserForPasswordReset(null);
        }}
        user={userForPasswordReset}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </div>
  );
}

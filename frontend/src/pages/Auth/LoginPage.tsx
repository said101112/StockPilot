import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/shared/context/ToastContext';
import type { LoginRequest } from '@/features/auth/domain/types';
import { StockPilotLogo } from '@/components/common/StockPilotLogo';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';
import { ShieldCheck, Briefcase, Boxes, Sparkles, Zap, Check } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    label: 'Admin',
    fullLabel: 'Administrateur',
    email: 'admin@stockpilot.com',
    password: 'Admin@1234',
    badgeClass: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
    activeClass: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30',
    icon: ShieldCheck,
    desc: 'Accès complet',
  },
  {
    role: 'MANAGER',
    label: 'Manager',
    fullLabel: 'Manager Achats',
    email: 'manager@stockpilot.com',
    password: 'Manager@1234',
    badgeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    activeClass: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30',
    icon: Briefcase,
    desc: 'Achats & Commandes',
  },
  {
    role: 'USER',
    label: 'Magasinier',
    fullLabel: 'Magasinier Stock',
    email: 'user@stockpilot.com',
    password: 'User@1234',
    badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    activeClass: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30',
    icon: Boxes,
    desc: 'Stock & Entrées',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useToast();
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const from = (location.state as any)?.from?.pathname || '/';
  const [isChecked, setIsChecked] = useState(false);

  const activeAccount = DEMO_ACCOUNTS.find((acc) => acc.email === form.email);

  const performLogin = async (creds: LoginRequest) => {
    setLoading(true);
    try {
      await login(creds);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (acc: (typeof DEMO_ACCOUNTS)[0], autoLogin = false) => {
    const creds = { email: acc.email, password: acc.password };
    setForm(creds);
    if (autoLogin) {
      void performLogin(creds);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(form);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-full max-w-md p-6 mx-auto bg-white rounded-2xl shadow-lg dark:bg-gray-900 sm:p-8">
        <div className="mb-5 sm:mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <StockPilotLogo size="lg" />
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
              Stock<span className="text-brand-500">Pilot</span>
            </span>
          </Link>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>

        {/* Quick Demo Seeders */}
        <div className="mb-5 p-3.5 bg-gray-50 border border-gray-200/90 rounded-2xl dark:bg-gray-800/60 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Comptes de test (Seeders)
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              1 clic pour remplir
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = form.email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? acc.activeClass
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50'
                  }`}
                  title={`${acc.fullLabel} (${acc.email})`}
                >
                  {isSelected && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-brand-500 text-white">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <div className={`p-1.5 rounded-lg mb-1 border ${acc.badgeClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {acc.label}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-full">
                    {acc.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {activeAccount && (
            <div className="mt-2.5 pt-2 border-t border-gray-200/70 dark:border-gray-700/70 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 truncate text-[11px]">
                🔑 <strong className="text-gray-700 dark:text-gray-300">{activeAccount.label}</strong> : {activeAccount.email}
              </span>
              <button
                type="button"
                onClick={() => handleSelectDemo(activeAccount, true)}
                disabled={loading}
                className="inline-flex items-center gap-1 font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 text-[11px] cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Connexion 1-clic
              </button>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="info@gmail.com"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block text-sm font-normal text-gray-700 dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              <Link to="/" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Forgot password?
              </Link>
            </div>
            <div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useToast();
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const from = (location.state as any)?.from?.pathname || '/';
  const [isChecked, setIsChecked] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-full max-w-md p-6 mx-auto bg-white rounded-2xl shadow-lg dark:bg-gray-900 sm:p-8">
        <div className="mb-5 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm mb-4">
            <StockPilotLogo size="md" />
          </Link>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="space-y-5">
            <div>
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                type="email"
                placeholder="info@gmail.com"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Password <span className="text-error-500">*</span></Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, password: e.target.value }))}
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
              <Button className="w-full" size="sm" disabled={loading}>
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

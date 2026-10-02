import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/shared/context/ToastContext';
import type { RegisterRequest } from '@/features/auth/domain/types';
import { StockPilotLogo } from '@/components/common/StockPilotLogo';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';

export default function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [form, setForm] = useState<RegisterRequest>({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChecked) {
      showError('Please accept the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Échec d\'inscription');
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
            Sign Up
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your details to create an account
          </p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="space-y-5">
            <div>
              <Label>First Name</Label>
              <Input
                type="text"
                placeholder="John"
                value={form.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
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
                minLength={6}
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="block text-sm font-normal text-gray-700 dark:text-gray-400">
                By creating an account, you agree to the terms and conditions
              </span>
            </div>
            <div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </div>
          </div>
        </form>
        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

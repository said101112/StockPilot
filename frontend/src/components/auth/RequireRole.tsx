import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/features/auth/domain/types';

export default function RequireRole({ roles }: { roles: Role[] }) {
  const { user, status } = useAuth();
  if (status === 'loading') return null;
  if (status !== 'authenticated' || !user || !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet />;
}

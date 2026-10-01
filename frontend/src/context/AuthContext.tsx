import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import type { AuthResponse, LoginRequest, RegisterRequest, Role, User } from '@/features/auth/domain/types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
}

interface AuthContextValue extends AuthState {
  login: (creds: LoginRequest) => Promise<void>;
  register: (creds: RegisterRequest) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<string | null>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_KEY = 'sp_access_token';
const REFRESH_KEY = 'sp_refresh_token';
const USER_KEY = 'sp_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'loading',
  });

  useEffect(() => {
    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (access && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setState({ user, accessToken: access, refreshToken: refresh, status: 'authenticated' });
      } catch {
        localStorage.clear();
        setState({ user: null, accessToken: null, refreshToken: null, status: 'anonymous' });
      }
    } else {
      setState({ user: null, accessToken: null, refreshToken: null, status: 'anonymous' });
    }
  }, []);

  const persist = (res: AuthResponse) => {
    localStorage.setItem(ACCESS_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setState({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken, status: 'authenticated' });
  };

  const clear = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, accessToken: null, refreshToken: null, status: 'anonymous' });
  };

  const login = async (creds: LoginRequest) => {
    const res = await authApi.login(creds);
    persist(res);
  };

  const register = async (creds: RegisterRequest) => {
    const res = await authApi.register(creds);
    persist(res);
  };

  const refresh = async (): Promise<string | null> => {
    const rt = state.refreshToken ?? localStorage.getItem(REFRESH_KEY);
    if (!rt) { clear(); return null; }
    try {
      const res = await authApi.refresh({ refreshToken: rt });
      persist(res);
      return res.accessToken;
    } catch {
      clear();
      return null;
    }
  };

  const logout = () => {
    void authApi.logout().catch(() => {});
    clear();
    window.location.href = '/login';
  };

  const hasRole = (...roles: Role[]) => {
    if (state.status !== 'authenticated' || !state.user) return false;
    return roles.includes(state.user.role);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refresh, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

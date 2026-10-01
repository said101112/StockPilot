import { apiClient } from '@/shared/api/httpClient';
import type { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest, User } from '../domain/types';

export const authApi = {
  login: (data: LoginRequest) => apiClient<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: RegisterRequest) => apiClient<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (data: RefreshTokenRequest) => apiClient<AuthResponse>('/api/auth/refresh', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiClient<User>('/api/auth/me', { method: 'GET' }),
  logout: () => apiClient<void>('/api/auth/logout', { method: 'POST' }),
};

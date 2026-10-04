import { apiClient } from '@/shared/api/httpClient';
import type { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest, User } from '../domain/types';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: (data: LoginRequest) => apiClient<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: RegisterRequest) => apiClient<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (data: RefreshTokenRequest) => apiClient<AuthResponse>('/api/auth/refresh', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiClient<User>('/api/auth/me', { method: 'GET' }),
  logout: () => apiClient<void>('/api/auth/logout', { method: 'POST' }),
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient<User>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: ChangePasswordPayload) =>
    apiClient<{ message: string }>('/api/auth/password', { method: 'PATCH', body: JSON.stringify(data) }),
};

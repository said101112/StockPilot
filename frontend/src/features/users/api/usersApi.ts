import { httpClient } from '@/shared/api/httpClient';
import type {
  UserItem,
  CreateUserPayload,
  UpdateUserRolePayload,
  ResetPasswordPayload,
} from '../domain/types';

export const usersApi = {
  getAll: () => httpClient.get<UserItem[]>('/users'),

  create: (payload: CreateUserPayload) =>
    httpClient.post<UserItem>('/users', payload),

  toggleStatus: (userId: string) =>
    httpClient.patch<UserItem>(`/users/${userId}/toggle-status`, {}),

  updateRole: (userId: string, payload: UpdateUserRolePayload) =>
    httpClient.patch<UserItem>(`/users/${userId}/role`, payload),

  resetPassword: (userId: string, payload: ResetPasswordPayload) =>
    httpClient.patch<{ message: string }>(`/users/${userId}/password`, payload),
};

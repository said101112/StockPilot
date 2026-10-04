import type { Role } from '@/features/auth/domain/types';

export interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  enabled: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UpdateUserRolePayload {
  role: Role;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

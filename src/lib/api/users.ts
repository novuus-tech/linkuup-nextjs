import { apiClient } from '@/lib/api-client';

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roles: string[];
  isActive?: boolean;
}

export interface CommercialUser {
  id: string;
  fullName: string;
  slug: string;
}

export const usersApi = {
  getAll: () => apiClient.get('/users'),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  getCommercials: () => apiClient.get<CommercialUser[]>('/users/commercials'),
  create: (user: UserPayload) => apiClient.post('/users', user),
  update: (id: string, user: Partial<UserPayload>) =>
    apiClient.put(`/users/${id}`, user),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

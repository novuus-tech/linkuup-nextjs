import { apiClient } from '@/lib/api-client';

export const appointmentsApi = {
  getAll: (startDate: string, endDate: string, page = 1, limit = 100) =>
    apiClient.get(
      `appointments?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
    ),

  getById: (id: string) => apiClient.get(`appointments/${id}`),

  getByUserId: (userId: string, date: string, page = 1, limit = 100) =>
    apiClient.get(
      `appointments/user/${userId}?date=${date}&page=${page}&limit=${limit}`
    ),

  getByWeek: (week: string) =>
    apiClient.get(`appointments/week?week=${week}`),

  create: (userId: string, data: Record<string, unknown>) =>
    apiClient.post(`appointments/create/${userId}`, data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`appointments/${id}`, data),

  delete: (id: string) => apiClient.delete(`appointments/${id}`),
};

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import type { Appointment } from '@/lib/types/appointment';

export function useAppointmentsByUser(
  userId: string | undefined,
  date: string,
  page = 1,
  limit = 100
) {
  return useQuery({
    queryKey: ['appointments', 'user', userId, date, page, limit],
    queryFn: async () => {
      if (!userId) return { appointments: { docs: [] } };
      const { data } = await appointmentsApi.getByUserId(
        userId,
        date,
        page,
        limit
      );
      return data;
    },
    enabled: !!userId,
  });
}

export function useAppointmentsByWeek(week: string) {
  return useQuery({
    queryKey: ['appointments', 'week', week],
    queryFn: async () => {
      const { data } = await appointmentsApi.getByWeek(week);
      return data;
    },
  });
}

export function useAllAppointments(
  startDate: string,
  endDate: string,
  page = 1,
  limit = 400
) {
  return useQuery({
    queryKey: ['appointments', 'all', startDate, endDate, page, limit],
    queryFn: async () => {
      const { data } = await appointmentsApi.getAll(
        startDate,
        endDate,
        page,
        limit
      );
      return data;
    },
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await appointmentsApi.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Record<string, unknown>;
    }) => appointmentsApi.create(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Partial<Appointment> }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

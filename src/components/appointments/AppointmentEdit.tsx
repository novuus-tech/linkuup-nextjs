'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { appointmentsApi } from '@/lib/api/appointments';
import { useUpdateAppointment, useDeleteAppointment } from '@/lib/hooks/useAppointments';
import { useCommercials } from '@/lib/hooks/useUsers';
import { TIME_SLOTS } from '@/lib/types/appointment';
import { getErrorMessage } from '@/lib/utils/errors';
import type { Appointment, AppointmentStatus } from '@/lib/types/appointment';
import { getInputClass } from '@/lib/utils/input';

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'pending', label: 'En Attente' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'not-interested', label: 'Pas Intéressé' },
  { value: 'to-be-reminded', label: 'A Rappeler' },
  { value: 'longest-date', label: 'Date Eloignée' },
];

export function AppointmentEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();
  const { data: commercials = [] } = useCommercials();

  const [formData, setFormData] = useState<Partial<Appointment>>({
    date: dayjs().format('YYYY-MM-DD'),
    name: '',
    status: undefined as AppointmentStatus | undefined,
    comment: '',
    address: '',
    commercial: '',
    phone_1: '',
    phone_2: '',
    time: '',
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await appointmentsApi.getById(id);
      return data;
    },
    enabled: !!id,
  });

  const appointment = data?.appointment ?? {};

  useEffect(() => {
    if (appointment && Object.keys(appointment).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...appointment,
        date: dayjs((appointment as Appointment).date).format('YYYY-MM-DD'),
      }));
    }
  }, [appointment]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, data: formData });
      router.back();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        router.back();
      } catch {
        // Error handled by mutation
      }
    }
  };

  const inputField = () => getInputClass();
  const btnPrimary =
    'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98]';
  const btnSecondary =
    'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
          Erreur de chargement
        </h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">
          {getErrorMessage(error)}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-slate-800 dark:text-red-400"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Modifier le rendez-vous
      </h1>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <p className="mb-6 text-sm text-slate-500 dark:text-gray-400">
          Rendez-vous pris par {appointment?.userId?.firstName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Statut
              </label>
              <select
                name="status"
                value={formData.status ?? ''}
                onChange={handleChange}
                className={inputField()}
              >
                <option value="">Sélectionner un statut</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Commercial
              </label>
              <select
                name="commercial"
                value={formData.commercial ?? ''}
                onChange={handleChange}
                required
                className={inputField()}
              >
                <option value="">Sélectionner un commercial</option>
                {commercials.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Nom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name ?? ''}
                onChange={handleChange}
                className={inputField()}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Date & Heure
              </label>
              <div className="flex gap-3">
                <input
                  type="date"
                  name="date"
                  value={formData.date ?? ''}
                  onChange={handleChange}
                  className={`${inputField()} flex-1`}
                />
                <select
                  name="time"
                  value={formData.time ?? ''}
                  onChange={handleChange}
                  className={`${inputField()} w-32`}
                >
                  <option value="">Heure</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Téléphone (fixe)
              </label>
              <input
                type="text"
                name="phone_1"
                value={formData.phone_1 ?? ''}
                onChange={handleChange}
                className={inputField()}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Téléphone (mobile)
              </label>
              <input
                type="text"
                name="phone_2"
                value={formData.phone_2 ?? ''}
                onChange={handleChange}
                className={inputField()}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address ?? ''}
                onChange={handleChange}
                className={inputField()}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
                Commentaire
              </label>
              <textarea
                name="comment"
                value={formData.comment ?? ''}
                onChange={handleChange}
                rows={3}
                className={`${inputField()} resize-none`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className={btnPrimary}
            >
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Supprimer
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className={btnSecondary}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

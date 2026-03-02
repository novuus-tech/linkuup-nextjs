'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { appointmentsApi } from '@/lib/api/appointments';
import { getStatusLabel, getStatusColor } from '@/lib/utils/status';
import { formatCommercialName } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/utils/errors';
import { getInputClass } from '@/lib/utils/input';

interface AppointmentListProps {
  refreshTrigger?: boolean;
}

export function AppointmentList({ refreshTrigger }: AppointmentListProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id ?? (user as { _id?: string })?._id;

  const formattedDate = dayjs().format('YYYY-MM');
  const [selectedDate, setSelectedDate] = useState(formattedDate);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appointments', 'user', userId, selectedDate, refreshTrigger],
    queryFn: async () => {
      if (!userId) return { appointments: { docs: [] } };
      const { data: res } = await appointmentsApi.getByUserId(
        userId,
        selectedDate,
        1,
        100
      );
      return res;
    },
    enabled: mounted && !!userId,
  });

  const appointments = [...(data?.appointments?.docs ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
  );

  if (!mounted) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-gray-400">
        Chargement...
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-slate-200 bg-slate-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/30">
        <input
          type="month"
          min="2023-01"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`${getInputClass()} max-w-[200px]`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                #
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Date
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Nom
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Téléphone
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Adresse
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Date RDV
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Commercial
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {appointments.map((apt: { _id: string; createdAt?: string; name: string; phone_1?: string; phone_2?: string; address?: string; date: string; time: string; commercial: string; status: string }, index: number) => (
              <tr
                key={apt._id}
                className="transition-colors hover:bg-indigo-50/50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3 text-slate-600 dark:text-gray-400">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  {dayjs(apt.createdAt).format('DD/MM')}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  {apt.name.toUpperCase()}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-gray-400">
                  {apt.phone_1 && apt.phone_2
                    ? `${apt.phone_1} / ${apt.phone_2}`
                    : apt.phone_1 || apt.phone_2}
                </td>
                <td className="max-w-[120px] truncate px-4 py-3 text-slate-600 dark:text-gray-400">
                  {apt.address?.toLowerCase()}
                </td>
                <td className="px-4 py-3">
                  {dayjs(apt.date).format('DD/MM/YY')}, {apt.time}
                </td>
                <td className="px-4 py-3">
                  {formatCommercialName(apt.commercial)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}
                  >
                    {getStatusLabel(apt.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          <p className="font-medium">Erreur de chargement</p>
          <p className="mt-1 text-sm">{getErrorMessage(error)}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!isLoading && !isError && appointments.length === 0 && (
        <div className="py-12 text-center text-slate-500 dark:text-gray-400">
          Aucun rendez-vous pour cette période
        </div>
      )}
    </div>
  );
}

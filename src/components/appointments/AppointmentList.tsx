'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { appointmentsApi } from '@/lib/api/appointments';
import { getStatusLabel, getStatusColor } from '@/lib/utils/status';
import { formatCommercialName } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/utils/errors';
import { getInputClass } from '@/lib/utils/input';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable, SkeletonStatCards } from '@/components/ui/Skeleton';

dayjs.locale('fr');

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

  // Compute stats
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a: { status: string }) => a.status === 'Honore').length;
    const pending = appointments.filter((a: { status: string }) => a.status === 'A confirmer' || a.status === 'Confirme').length;
    const cancelled = appointments.filter((a: { status: string }) => a.status === 'Annule' || a.status === 'Reporte').length;
    return { total, confirmed, pending, cancelled };
  }, [appointments]);

  const monthLabel = dayjs(selectedDate).format('MMMM YYYY');

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonStatCards count={4} />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats row */}
      {!isLoading && !isError && appointments.length > 0 && (
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            label="Total RDV"
            value={stats.total}
            color="indigo"
            delay={1}
          />
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label={"Honores"}
            value={stats.confirmed}
            color="emerald"
            delay={2}
          />
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="En attente"
            value={stats.pending}
            color="amber"
            delay={3}
          />
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
            label={"Annules / Reportes"}
            value={stats.cancelled}
            color="red"
            delay={4}
          />
        </div>
      )}

      {/* Date filter */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <input
            type="month"
            min="2023-01"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`${getInputClass()} max-w-[200px]`}
          />
          <span className="hidden text-sm font-medium text-muted capitalize sm:inline">
            {monthLabel}
          </span>
        </div>
        {!isLoading && appointments.length > 0 && (
          <span className="text-xs font-medium text-muted">
            {appointments.length} rendez-vous
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                #
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                {"Cree le"}
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Nom
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                {"Telephone"}
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Adresse
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Date RDV
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Commercial
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {appointments.map((apt: { _id: string; createdAt?: string; name: string; phone_1?: string; phone_2?: string; address?: string; date: string; time: string; commercial: string; status: string }, index: number) => (
              <tr
                key={apt._id}
                className="table-row-hover"
              >
                <td className="px-5 py-3.5 text-muted">
                  {index + 1}
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {dayjs(apt.createdAt).format('DD/MM')}
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                  {apt.name.toUpperCase()}
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {apt.phone_1 && apt.phone_2
                      ? `${apt.phone_1} / ${apt.phone_2}`
                      : apt.phone_1 || apt.phone_2}
                  </div>
                </td>
                <td className="max-w-[120px] truncate px-5 py-3.5 text-slate-600 dark:text-slate-400">
                  {apt.address?.toLowerCase()}
                </td>
                <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                  {dayjs(apt.date).format('DD/MM/YY')}, {apt.time}
                </td>
                <td className="px-5 py-3.5">
                  {formatCommercialName(apt.commercial)}
                </td>
                <td className="px-5 py-3.5">
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
        <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          <p className="font-medium">Erreur de chargement</p>
          <p className="mt-1 text-sm">{getErrorMessage(error)}</p>
        </div>
      )}

      {isLoading && (
        <SkeletonTable rows={6} />
      )}

      {!isLoading && !isError && appointments.length === 0 && (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
          }
          title={"Aucun rendez-vous pour cette periode"}
          description={"Selectionnez une autre periode ou creez un nouveau rendez-vous."}
        />
      )}
    </div>
  );
}

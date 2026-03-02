'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { appointmentsApi } from '@/lib/api/appointments';
import { getStatusLabel, getStatusColor } from '@/lib/utils/status';
import { formatCommercialName } from '@/lib/utils/format';
import { formatSelectedDate } from '@/lib/utils/date';
import { downloadAsCSV } from '@/lib/utils/csv';
import { getErrorMessage } from '@/lib/utils/errors';
import { getInputClass } from '@/lib/utils/input';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable, SkeletonStatCards } from '@/components/ui/Skeleton';

dayjs.extend(isoWeek);

interface AppointmentDoc {
  _id: string;
  name: string;
  phone_1?: string;
  phone_2?: string;
  address?: string;
  date: string;
  time: string;
  commercial: string;
  status: string;
  createdAt?: string;
  userId?: { firstName?: string };
}

const defaultStart = dayjs().startOf('isoWeek').toDate();
const defaultEnd = dayjs().endOf('isoWeek').toDate();

export function AppointmentAllList() {
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    defaultStart,
    defaultEnd,
  ]);
  const [startDate, endDate] = dateRange;

  const startDateStr = startDate ? formatSelectedDate(startDate) : '';
  const endDateStr = endDate ? formatSelectedDate(endDate) : startDateStr;
  const titleDate = endDate ? formatSelectedDate(endDate) : null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appointments', 'all', startDateStr, endDateStr],
    queryFn: async () => {
      const { data: res } = await appointmentsApi.getAll(
        startDateStr,
        endDateStr,
        1,
        400
      );
      return res;
    },
    enabled: !!startDateStr,
  });

  const appointments = data?.appointments ?? {};
  const docs = (appointments as { docs?: AppointmentDoc[] })?.docs ?? [];
  const totalDocs = (appointments as { totalDocs?: number })?.totalDocs ?? 0;

  const filteredAppointments = useMemo(() => {
    let result = docs;
    if (filterAgent) {
      const lower = filterAgent.toLowerCase();
      result = result.filter((item) =>
        item.userId?.firstName?.toLowerCase().includes(lower)
      );
    }
    if (filterStatus) {
      result = result.filter((item) => item.status === filterStatus);
    }
    return result;
  }, [docs, filterAgent, filterStatus]);

  const sorted = [...filteredAppointments].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
  );

  // Compute stats
  const stats = useMemo(() => {
    const confirmed = docs.filter((a) => a.status === 'Honore').length;
    const pending = docs.filter((a) => a.status === 'A confirmer' || a.status === 'Confirme').length;
    const cancelled = docs.filter((a) => a.status === 'Annule' || a.status === 'Reporte').length;
    return { total: totalDocs, confirmed, pending, cancelled };
  }, [docs, totalDocs]);

  const handleDateChange = (update: [Date | null, Date | null]) => {
    setDateRange(update);
  };

  const inputField = () => getInputClass();

  return (
    <div>
      {/* Stats */}
      {!isLoading && !isError && docs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            label={"Total periode"}
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

      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex flex-wrap items-center gap-3">
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Du ... au ..."
            className={`${inputField()} min-w-[220px]`}
            monthsShown={2}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${inputField()} max-w-[180px]`}
          >
            <option value="">Tous les statuts</option>
            <option value="Honore">{"Honore"}</option>
            <option value="Confirme">{"Confirme"}</option>
            <option value="A confirmer">{"A confirmer"}</option>
            <option value="Annule">{"Annule"}</option>
            <option value="Reporte">{"Reporte"}</option>
          </select>
          <button
            type="button"
            onClick={() =>
              downloadAsCSV(
                appointments as { docs?: AppointmentDoc[] },
                titleDate ?? undefined
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filtrer par agent..."
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className={`${inputField()} max-w-[200px]`}
          />
          {(filterAgent || filterStatus) && (
            <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
              {sorted.length} sur {totalDocs}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">#</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">Agent</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">{"Cree le"}</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">Docteur</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">{"Telephone"}</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">Date RDV</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">Commercial</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sorted.map((apt, index) => (
              <tr key={apt._id} className="table-row-hover">
                <td className="px-5 py-3.5 text-muted">{index + 1}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{apt.userId?.firstName}</td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {dayjs(apt.createdAt).format('DD/MM')}
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{apt.name.toUpperCase()}</td>
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
                <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                  {dayjs(apt.date).format('DD/MM/YY')}, {apt.time}
                </td>
                <td className="max-w-[80px] truncate px-5 py-3.5">
                  {formatCommercialName(apt.commercial)}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/appointments/edit/${apt._id}`}
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    {"Editer"}
                  </Link>
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

      {isLoading && <SkeletonTable rows={8} />}

      {!isLoading && !isError && sorted.length === 0 && (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
          title={"Aucun rendez-vous trouve"}
          description={"Modifiez vos filtres ou selectionnez une autre periode."}
        />
      )}
    </div>
  );
}

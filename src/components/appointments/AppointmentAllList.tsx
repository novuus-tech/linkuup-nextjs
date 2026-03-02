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
    if (!filterAgent) return docs;
    const lower = filterAgent.toLowerCase();
    return docs.filter((item) =>
      item.userId?.firstName?.toLowerCase().includes(lower)
    );
  }, [docs, filterAgent]);

  const sorted = [...filteredAppointments].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
  );

  const handleDateChange = (update: [Date | null, Date | null]) => {
    setDateRange(update);
  };

  const inputField = () => getInputClass();
  const btnSecondary =
    'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
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
          </div>
          <button
            type="button"
            onClick={() =>
              downloadAsCSV(
                appointments as { docs?: AppointmentDoc[] },
                titleDate ?? undefined
              )
            }
            className={btnSecondary}
          >
            Télécharger CSV
          </button>
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {totalDocs} rendez-vous
          </span>
        </div>
        <input
          type="text"
          placeholder="Filtrer par agent..."
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className={`${inputField()} max-w-[240px]`}
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
                Agent
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Date
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Docteur
              </th>
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Téléphone
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
              <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sorted.map((apt, index) => (
              <tr
                key={apt._id}
                className="transition-colors hover:bg-indigo-50/50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3 text-slate-600 dark:text-gray-400">
                  {index + 1}
                </td>
                <td className="px-4 py-3 font-medium">
                  {apt.userId?.firstName}
                </td>
                <td className="px-4 py-3">
                  {dayjs(apt.createdAt).format('DD/MM')}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  {apt.name.toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  {apt.phone_1 && apt.phone_2
                    ? `${apt.phone_1} / ${apt.phone_2}`
                    : apt.phone_1 || apt.phone_2}
                </td>
                <td className="px-4 py-3">
                  {dayjs(apt.date).format('DD/MM/YY')}, {apt.time}
                </td>
                <td className="max-w-[80px] truncate px-4 py-3">
                  {formatCommercialName(apt.commercial)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}
                  >
                    {getStatusLabel(apt.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/appointments/edit/${apt._id}`}
                    className="font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Éditer
                  </Link>
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
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <div className="py-12 text-center text-slate-500 dark:text-gray-400">
          Aucun rendez-vous pour cette période
        </div>
      )}
    </div>
  );
}

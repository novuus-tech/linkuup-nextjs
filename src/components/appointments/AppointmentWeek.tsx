'use client';

import { useMemo } from 'react';
import { useWeekManager } from '@/lib/utils/date';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import { getInputClass } from '@/lib/utils/input';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable, SkeletonStatCards } from '@/components/ui/Skeleton';

interface EmployeeWeek {
  name: string;
  week?: number[];
}

function getCellColor(value: number) {
  if (value === 0) return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400';
  if (value <= 2) return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
}

export function AppointmentWeek() {
  const { week, handleWeekChange } = useWeekManager();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appointments', 'week', week],
    queryFn: async () => {
      const { data } = await appointmentsApi.getByWeek(week);
      return data;
    },
  });

  const employees: EmployeeWeek[] = (data?.employees ?? []).map(
    ({ week: w, ...emp }: { week?: number[] }) => ({
      ...emp,
      week: w?.slice(1, 6),
    })
  );

  const calculateTotal = (sales: number[] = []) =>
    sales.reduce((a, b) => a + b, 0);

  // Compute stats
  const stats = useMemo(() => {
    const grandTotal = calculateTotal(employees.flatMap((e) => e.week ?? []));
    const agentCount = employees.length;
    const avgPerDay = agentCount > 0 ? (grandTotal / (agentCount * 5)).toFixed(1) : '0';
    let bestAgent = '-';
    let bestTotal = 0;
    employees.forEach(e => {
      const t = calculateTotal(e.week);
      if (t > bestTotal) { bestTotal = t; bestAgent = e.name; }
    });
    return { grandTotal, avgPerDay, bestAgent, bestTotal };
  }, [employees]);

  if (isLoading) {
    return (
      <div className="p-5 space-y-6">
        <SkeletonStatCards count={3} />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
        <p className="font-medium">Erreur de chargement</p>
        <p className="mt-1 text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      {employees.length > 0 && (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            }
            label="Total semaine"
            value={stats.grandTotal}
            color="indigo"
            delay={1}
          />
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            }
            label="Meilleur agent"
            value={stats.bestAgent}
            color="emerald"
            delay={2}
          />
          <StatCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            }
            label="Moyenne / jour"
            value={stats.avgPerDay}
            color="amber"
            delay={3}
          />
        </div>
      )}

      {/* Week filter + legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <input
            type="week"
            aria-label="Semaine"
            value={week}
            onChange={(e) => handleWeekChange(e.target.value)}
            className={`${getInputClass()} max-w-[200px]`}
          />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-red-100 dark:bg-red-500/20" />
            <span className="text-muted">0 RDV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-100 dark:bg-amber-500/20" />
            <span className="text-muted">1-2 RDV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-100 dark:bg-emerald-500/20" />
            <span className="text-muted">{"3+ RDV"}</span>
          </div>
        </div>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
          title={"Aucune donnee pour cette semaine"}
          description={"Selectionnez une autre semaine pour voir les statistiques."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="bg-slate-50/80 px-5 py-3.5 text-left font-semibold text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                  Agent
                </th>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(
                  (day) => (
                    <th
                      key={day}
                      className="bg-slate-50/80 px-5 py-3.5 text-center font-semibold text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
                    >
                      {day}
                    </th>
                  )
                )}
                <th className="bg-slate-50/80 px-5 py-3.5 text-center font-semibold text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {employees.map((employee, index) => {
                const total = calculateTotal(employee.week);
                return (
                  <tr key={index} className="table-row-hover">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {employee.name}
                    </td>
                    {employee.week?.map((sale, dayIndex) => (
                      <td key={dayIndex} className="px-5 py-3.5 text-center">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${getCellColor(sale)}`}>
                          {sale}
                        </span>
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold ${total > 14 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {total > 14 && (
                          <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        )}
                        {total}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {employees.length > 0 && employees[0].week && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 dark:border-slate-600">
                  <td className="bg-slate-50/80 px-5 py-3.5 font-bold text-slate-900 dark:bg-slate-800/50 dark:text-white">
                    Total
                  </td>
                  {employees[0].week.map((_, dayIndex) => {
                    const dayTotal = employees.reduce((t, e) => t + (e.week?.[dayIndex] ?? 0), 0);
                    return (
                      <td key={dayIndex} className="bg-slate-50/80 px-5 py-3.5 text-center dark:bg-slate-800/50">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${getCellColor(dayTotal > 2 ? 3 : dayTotal)}`}>
                          {dayTotal}
                        </span>
                      </td>
                    );
                  })}
                  <td className="bg-slate-50/80 px-5 py-3.5 text-center font-bold text-indigo-600 dark:bg-slate-800/50 dark:text-indigo-400">
                    {calculateTotal(employees.flatMap((e) => e.week ?? []))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

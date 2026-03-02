'use client';

import { useWeekManager } from '@/lib/utils/date';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import { getInputClass } from '@/lib/utils/input';

interface EmployeeWeek {
  name: string;
  week?: number[];
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

  const inputField = () => getInputClass();

  if (isLoading) return <div className="p-4">Chargement...</div>;
  if (isError)
    return (
      <div className="p-4 text-red-500">
        Erreur: {(error as Error).message}
      </div>
    );

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="week"
          aria-label="Semaine"
          value={week}
          onChange={(e) => handleWeekChange(e.target.value)}
          className={`${inputField()} max-w-[200px]`}
        />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
        Nombre de rendez-vous pris par jour (par agent)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Agent
              </th>
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(
                (day) => (
                  <th
                    key={day}
                    className="border border-slate-200 bg-indigo-50 px-4 py-3 text-center font-semibold text-slate-700 dark:border-slate-600 dark:bg-indigo-900/20 dark:text-slate-300"
                  >
                    {day}
                  </th>
                )
              )}
              <th className="border border-slate-200 bg-indigo-50 px-4 py-3 text-center font-semibold text-slate-700 dark:border-slate-600 dark:bg-indigo-900/20 dark:text-slate-300">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr
                key={index}
                className="border-b border-slate-200 dark:border-slate-600"
              >
                <td className="border-r border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-white">
                  {employee.name}
                </td>
                {employee.week?.map((sale, dayIndex) => (
                  <td
                    key={dayIndex}
                    className={`border-r border-slate-200 px-4 py-3 text-center font-semibold ${
                      sale > 2
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    } ${sale === 0 ? '!text-red-500 dark:!text-red-400' : ''}`}
                  >
                    {sale}
                  </td>
                ))}
                <td
                  className={`px-4 py-3 text-center font-bold ${
                    calculateTotal(employee.week) > 14
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : ''
                  }`}
                >
                  {calculateTotal(employee.week) > 14 && (
                    <span className="mr-1">★</span>
                  )}
                  {calculateTotal(employee.week)}
                </td>
              </tr>
            ))}
          </tbody>
          {employees.length > 0 && employees[0].week && (
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100 dark:border-slate-500 dark:bg-slate-800">
                <td className="border-r border-slate-200 px-4 py-3 text-left font-bold text-slate-900 dark:border-slate-600 dark:text-white">
                  Total
                </td>
                {employees[0].week.map((_, dayIndex) => (
                  <td
                    key={dayIndex}
                    className={`border-r border-slate-200 px-4 py-3 text-center font-bold ${
                      employees.reduce(
                        (t, e) => t + (e.week?.[dayIndex] ?? 0),
                        0
                      ) > 14
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {employees.reduce(
                      (t, e) => t + (e.week?.[dayIndex] ?? 0),
                      0
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                  {calculateTotal(employees.flatMap((e) => e.week ?? []))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

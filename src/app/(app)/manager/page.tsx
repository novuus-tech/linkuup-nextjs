'use client';

import { AppointmentWeek } from '@/components/appointments/AppointmentWeek';
import { useClock } from '@/lib/utils/date';

export default function ManagerPage() {
  const time = useClock();

  return (
    <div className="space-y-6">
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Tableau de bord Manager
          </h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {"Nombre de rendez-vous pris par chaque agent, par jour"}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
            <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Heure actuelle</p>
            <span className="font-mono text-lg font-bold text-slate-700 dark:text-slate-200 tabular-nums">
              {time.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <AppointmentWeek />
      </div>
    </div>
  );
}

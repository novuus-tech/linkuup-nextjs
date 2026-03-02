'use client';

import { useState } from 'react';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AppointmentAdd } from '@/components/appointments/AppointmentAdd';

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleClose = () => {
    setRefreshTrigger((prev) => !prev);
    setOpenModal(false);
  };

  const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.98]';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Mes rendez-vous
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Gérez vos rendez-vous et consultez l&apos;historique
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className={`${btnPrimary} shrink-0`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau rendez-vous
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <AppointmentList refreshTrigger={refreshTrigger} />
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/80">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Nouveau rendez-vous
              </h2>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <AppointmentAdd onClose={handleClose} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

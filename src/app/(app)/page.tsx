'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AppointmentAdd } from '@/components/appointments/AppointmentAdd';
import Modal from '@/components/ui/Modal';

export default function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleClose = () => {
    setRefreshTrigger((prev) => !prev);
    setOpenModal(false);
  };

  const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.98]';

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
            Bonjour, {user?.firstName || 'Utilisateur'}
          </h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {"Gerez vos rendez-vous et consultez l'historique"}
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

      {/* Appointments table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <AppointmentList refreshTrigger={refreshTrigger} />
      </div>

      <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Nouveau rendez-vous" maxWidth="max-w-2xl">
        <AppointmentAdd onClose={handleClose} />
      </Modal>
    </div>
  );
}

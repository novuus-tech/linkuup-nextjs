'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RootState, AppDispatch } from '@/lib/store';
import { success, error } from '@/lib/store/slices/alertSlice';
import { useCreateAppointment } from '@/lib/hooks/useAppointments';
import { useCommercials } from '@/lib/hooks/useUsers';
import { TIME_SLOTS } from '@/lib/types/appointment';
import { getInputClass } from '@/lib/utils/input';

const appointmentSchema = z.object({
  commercial: z.string().min(1, 'Commercial requis'),
  date: z.string().min(1, 'Date requise'),
  time: z.string().min(1, 'Heure requise'),
  name: z.string().min(1, 'Nom requis'),
  phone_1: z.string().optional(),
  phone_2: z.string().optional(),
  address: z.string().optional(),
  comment: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface AppointmentAddProps {
  onClose: () => void;
}

export function AppointmentAdd({ onClose }: AppointmentAddProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const createMutation = useCreateAppointment();
  const { data: commercials = [] } = useCommercials();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      commercial: '',
      date: '',
      time: '',
      name: '',
      phone_1: '',
      phone_2: '',
      address: '',
      comment: '',
    },
  });

  const dateValue = watch('date');

  const onSubmit = async (data: AppointmentForm) => {
    const userId = user?.id ?? (user as { _id?: string })?._id ?? '';
    if (!userId) {
      dispatch(error('Session expirée. Veuillez vous reconnecter.'));
      return;
    }

    const payload = { ...data, commercial: data.commercial };

    try {
      await createMutation.mutateAsync({ userId, data: payload });
      dispatch(success('Rendez-vous créé avec succès'));
      reset();
      onClose();
    } catch {
      // Erreur affichée via MutationCache (alert global)
    }
  };

  const inputField = (err?: boolean) => getInputClass(err);
  const btnPrimary =
    'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98]';
  const btnSecondary =
    'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="commercial"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-gray-300"
          >
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            Commercial
          </label>
          <select
            id="commercial"
            className={inputField(!!errors.commercial)}
            {...register('commercial')}
          >
            <option value="">Sélectionner un commercial</option>
            {commercials.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.fullName}
              </option>
            ))}
          </select>
          {errors.commercial && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.commercial.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-gray-300">
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            {"Date & Heure"}
          </label>
          <div className="flex gap-3">
            <DatePicker
              selected={dateValue ? new Date(dateValue + 'T12:00:00') : null}
              onChange={(date: Date | null) => {
                if (!date) {
                  setValue('date', '');
                  return;
                }
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                setValue('date', `${y}-${m}-${d}`);
              }}
              dateFormat="dd/MM/yyyy"
              className={`${inputField()} flex-1`}
              placeholderText="Date"
            />
            <select
              className={`${inputField(!!errors.time)} w-32`}
              {...register('time')}
            >
              <option value="">Heure</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.date.message}
            </p>
          )}
          {errors.time && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.time.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-gray-300"
        >
          <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Nom complet
        </label>
        <input
          id="name"
          placeholder="Nom du patient"
          className={inputField(!!errors.name)}
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="phone_1"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-gray-300"
          >
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            {"Telephone (fixe)"}
          </label>
          <input
            id="phone_1"
            placeholder="Fixe"
            className={inputField()}
            {...register('phone_1')}
          />
        </div>
        <div>
          <label
            htmlFor="phone_2"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
          >
            Téléphone (mobile)
          </label>
          <input
            id="phone_2"
            placeholder="Mobile"
            className={inputField()}
            {...register('phone_2')}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
        >
          Adresse
        </label>
        <input
          id="address"
          placeholder="Casablanca, Maroc"
          className={inputField()}
          {...register('address')}
        />
      </div>

      <div>
        <label
          htmlFor="comment"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
        >
          Commentaire
        </label>
        <textarea
          id="comment"
          placeholder="Notes..."
          rows={3}
          className={`${inputField()} resize-none`}
          {...register('comment')}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending}
          className={btnPrimary}
        >
          {(isSubmitting || createMutation.isPending) ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
              Enregistrement...
            </span>
          ) : (
            'Enregistrer'
          )}
        </button>
        <button type="button" onClick={onClose} className={btnSecondary}>
          Annuler
        </button>
      </div>
    </form>
  );
}

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
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
          >
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
            Date & Heure
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
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
        >
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
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
          >
            Téléphone (fixe)
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

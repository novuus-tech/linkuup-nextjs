'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useCreateUser, useUpdateUser } from '@/lib/hooks/useUsers';
import { success, error } from '@/lib/store/slices/alertSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { getInputClass } from '@/lib/utils/input';

const userSchema = z
  .object({
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    email: z.string().min(1, 'Email requis').email('Email invalide'),
    password: z.string().optional(),
    roles: z.array(z.string()).min(1, 'Sélectionnez au moins un rôle'),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.password !== undefined && data.password !== '') {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: 'Le mot de passe doit contenir au moins 6 caractères',
      path: ['password'],
    }
  );

type UserFormData = z.infer<typeof userSchema>;

const ROLE_OPTIONS = [
  { value: 'user', label: 'Utilisateur' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'admin', label: 'Administrateur' },
] as const;

export function UserForm() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string | undefined;
  const dispatch = useDispatch<AppDispatch>();
  const isEdit = !!userId;

  const { data: userData, isLoading } = useUser(userId);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const user = (userData as { user?: unknown })?.user ?? userData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: ['user'],
      isActive: true,
    },
  });

  const watchedRoles = watch('roles') ?? [];

  useEffect(() => {
    if (user && isEdit) {
      const roles = ((user as { roles?: string[] }).roles ?? []).map((r) =>
        r.replace('ROLE_', '').toLowerCase()
      );
      reset({
        firstName: (user as { firstName?: string }).firstName ?? '',
        lastName: (user as { lastName?: string }).lastName ?? '',
        email: (user as { email?: string }).email ?? '',
        password: '',
        roles: roles.length > 0 ? roles : ['user'],
        isActive: (user as { isActive?: boolean }).isActive ?? true,
      });
    }
  }, [user, isEdit, reset]);

  const onSubmit = async (data: UserFormData) => {
    const formattedRoles = data.roles.map((r) =>
      r.toLowerCase().replace(/^role_/, '')
    );
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      roles: formattedRoles,
      isActive: data.isActive ?? true,
      ...(data.password?.trim() && { password: data.password }),
    };

    if (!isEdit && !payload.password) {
      dispatch(error('Le mot de passe est requis pour créer un utilisateur'));
      return;
    }

    try {
      if (isEdit && userId) {
        await updateMutation.mutateAsync({ id: userId, data: payload });
        dispatch(success('Utilisateur mis à jour'));
      } else {
        await createMutation.mutateAsync(payload as Parameters<typeof createMutation.mutateAsync>[0]);
        dispatch(success('Utilisateur créé'));
      }
      router.push('/users');
    } catch {
      // Erreur affichée via MutationCache (alert global)
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    const current = (watchedRoles ?? []) as string[];
    if (checked) {
      if (!current.includes(role)) setValue('roles', [...current, role]);
    } else {
      const next = current.filter((r) => r !== role);
      setValue('roles', next.length > 0 ? next : ['user']);
    }
  };

  const inputField = (err?: boolean) => getInputClass(err);
  const btnPrimary =
    'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98]';
  const btnSecondary =
    'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';

  if (isLoading && isEdit) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
      </h1>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                Prénom
              </label>
              <input
                id="firstName"
                className={inputField(!!errors.firstName)}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                Nom
              </label>
              <input
                id="lastName"
                className={inputField(!!errors.lastName)}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className={inputField(!!errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
              Activité
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={watch('isActive') ?? true}
                onChange={(e) => setValue('isActive', e.target.checked)}
              />
              <span className="text-sm text-slate-700 dark:text-gray-300">
                Compte actif (peut se connecter et créer des rendez-vous)
              </span>
            </label>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Mot de passe
              {isEdit && (
                <span className="ml-1 font-normal text-slate-500">
                  (laisser vide pour conserver)
                </span>
              )}
            </label>
            <input
              id="password"
              type="password"
              className={inputField(!!errors.password)}
              {...register('password')}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
              Rôles
            </label>
            <div className="flex flex-wrap gap-4">
              {ROLE_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className="inline-flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={watchedRoles.includes(value)}
                    onChange={(e) => handleRoleChange(value, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-gray-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {errors.roles && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.roles.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className={btnPrimary}
            >
              {(isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending) ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enregistrement...
                </span>
              ) : (
                'Enregistrer'
              )}
            </button>
            <button type="button" onClick={() => reset()} className={btnSecondary}>
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={() => router.push('/users')}
              className={btnSecondary}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

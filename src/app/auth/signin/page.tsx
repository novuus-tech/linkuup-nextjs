'use client';

import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signin } from '@/lib/store/slices/authSlice';
import { error } from '@/lib/store/slices/alertSlice';
import { AppDispatch } from '@/lib/store';
import { getInputClass } from '@/lib/utils/input';

const signInSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    const result = await dispatch(signin(data));
    if (signin.rejected.match(result)) {
      dispatch(
        error((result.payload as string) ?? "Échec de l'authentification")
      );
    }
  };

  const inputField = (err?: boolean) => getInputClass(err);
  const btnPrimary =
    'inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.98]';

  return (
    <div className="flex min-h-screen w-full">
      {/* Left: Branding / Illustration */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Linkuup Medical</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Gérez vos rendez-vous
            <br />
            <span className="text-indigo-200">sans effort</span>
          </h2>
          <p className="max-w-sm text-indigo-100">
            Planification, suivi et gestion des rendez-vous médicaux et commerciaux en un seul endroit.
          </p>
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-white/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Planning</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Suivi</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-indigo-200/80">© {new Date().getFullYear()} Linkuup Medical</p>
      </div>

      {/* Right: Form */}
      <div className="flex w-full items-center justify-center bg-white p-8 dark:bg-slate-950 lg:w-1/2">
        <div className="w-full max-w-md anim-slide-up">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Linkuup Medical</span>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Connexion
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nom@linkuup.com"
                className={inputField()}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={inputField()}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className={btnPrimary}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

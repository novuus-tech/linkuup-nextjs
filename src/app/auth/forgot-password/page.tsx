'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().min(1, 'Email requis').email('Adresse email invalide'),
});

type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSent(true);
    } catch {
      setError('root', { message: 'Une erreur est survenue. Veuillez réessayer.' });
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden w-1/2 flex-col justify-between bg-emerald-600 p-12 lg:flex" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Linkuup Medical</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Mot de passe oublié&nbsp;?</h2>
          <p className="max-w-sm text-emerald-100">
            Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        <p className="text-sm text-emerald-100">© {new Date().getFullYear()} Linkuup Medical</p>
      </div>

      <main className="flex w-full items-center justify-center bg-white p-8 dark:bg-zinc-950 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Réinitialiser le mot de passe
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Entrez l&apos;adresse email associée à votre compte
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              <p className="font-medium">Email envoyé</p>
              <p className="mt-1">Si votre adresse est enregistrée, vous recevrez un lien de réinitialisation sous peu.</p>
            </div>
          ) : (
            <>
              {errors.root?.message && (
                <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.root.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="nom@linkuup.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  {...register('email')}
                />

                <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                  Envoyer le lien
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/auth/signin" className="font-medium text-emerald-600 hover:text-emerald-500">
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

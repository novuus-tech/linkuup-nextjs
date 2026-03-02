import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
        Accès non autorisé
      </h1>
      <p className="mt-2 text-center text-slate-600 dark:text-slate-400">
        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/50">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
          Erreur
        </h2>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
          {error.message || 'Une erreur s\'est produite.'}
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          404
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          La page demandée est introuvable.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

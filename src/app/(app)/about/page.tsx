export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          À propos
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Découvrez Linkuup Medical
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <div className="flex gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="space-y-3">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Linkuup Medical est une application de gestion des rendez-vous médicaux
              et commerciaux. Elle permet aux agents de planifier, suivre et gérer
              leurs rendez-vous efficacement.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} Linkuup Medical — Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

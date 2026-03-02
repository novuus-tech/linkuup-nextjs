export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 py-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Linkuup Medical — Gestion des rendez-vous médicaux et commerciaux
        </p>
      </div>
    </footer>
  );
}

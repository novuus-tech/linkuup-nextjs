/**
 * Script exécuté avant le premier paint pour éviter le flash de thème incorrect.
 * Lit localStorage et prefers-color-scheme, applique la classe 'dark' sur <html>.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var s=localStorage.getItem('linkuup-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=s==='dark'||(s!=='light'&&d);document.documentElement.classList.toggle('dark',dark);})();`,
      }}
    />
  );
}

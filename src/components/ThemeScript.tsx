/**
 * Script execute avant le premier paint pour eviter le flash de theme incorrect.
 * Force le mode dark par defaut pour ce design.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var s=localStorage.getItem('linkuup-theme');var dark=s!=='light';document.documentElement.classList.toggle('dark',dark);})();`,
      }}
    />
  );
}

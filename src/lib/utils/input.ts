/**
 * Classes unifiées pour les inputs (input, select, textarea).
 * Utilise input-base de globals.css pour le thème light/dark.
 */
export const INPUT_CLASS = 'input-base';
export const INPUT_CLASS_ERROR = 'input-base input-base-error';

export function getInputClass(hasError?: boolean): string {
  return hasError ? INPUT_CLASS_ERROR : INPUT_CLASS;
}

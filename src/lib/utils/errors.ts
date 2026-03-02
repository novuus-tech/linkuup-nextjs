import { AxiosError } from 'axios';

/** Message d'erreur par défaut selon le code HTTP */
const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Requête invalide',
  401: 'Session expirée. Veuillez vous reconnecter.',
  403: 'Accès refusé',
  404: 'Ressource introuvable',
  409: 'Conflit de données',
  422: 'Données invalides',
  500: 'Erreur serveur. Veuillez réessayer plus tard.',
  502: 'Service temporairement indisponible',
  503: 'Service en maintenance',
};

/**
 * Extrait un message d'erreur lisible depuis une erreur API (Axios)
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    const status = err.response?.status;

    if (typeof data === 'object' && data !== null && 'message' in data) {
      const msg = (data as { message?: string }).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }

    if (typeof data === 'object' && data !== null && 'error' in data) {
      const msg = (data as { error?: string }).error;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }

    if (status && DEFAULT_MESSAGES[status]) {
      return DEFAULT_MESSAGES[status];
    }

    if (err.message) return err.message;
  }

  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;

  return 'Une erreur inattendue est survenue';
}

/**
 * Vérifie si l'erreur est une erreur d'authentification (401/403)
 */
export function isAuthError(err: unknown): boolean {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    return status === 401 || status === 403;
  }
  return false;
}

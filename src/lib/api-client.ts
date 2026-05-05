'use client';

import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { getErrorMessage } from '@/lib/utils/errors';

/**
 * Client HTTP centralisé.
 *
 * Les tokens JWT sont stockés dans des cookies httpOnly gérés par le serveur.
 * Le navigateur les envoie automatiquement grâce à `withCredentials: true`.
 * Aucun token n'est accessible au JavaScript côté client → protection XSS maximale.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

let onUnauthorized: (() => void) | null = null;

export function setApiUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

/** Routes d'auth pour lesquelles on NE doit PAS tenter de refresh. */
const AUTH_ROUTES_NO_REFRESH = ['/auth/signin', '/auth/refreshtoken', '/auth/logout'];

function isAuthRoute(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ROUTES_NO_REFRESH.some((route) => url.includes(route));
}

/**
 * Promesse de refresh partagée — évite les refresh en parallèle si plusieurs
 * requêtes échouent simultanément en 401.
 */
let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post('/auth/refreshtoken', null, { _skipAuthRefresh: true } as AxiosRequestConfig)
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalConfig = err.config as
      | (AxiosRequestConfig & { _retry?: boolean; _skipAuthRefresh?: boolean })
      | undefined;

    if (!err.response) {
      return Promise.reject(
        new Error('Impossible de joindre le serveur. Vérifiez votre connexion.')
      );
    }

    const status = err.response.status;
    const url = originalConfig?.url ?? '';
    const skipRefresh = originalConfig?._skipAuthRefresh || isAuthRoute(url);

    // 401 sur une route d'auth = identifiants invalides ou session terminée.
    // On NE refresh PAS — on propage l'erreur telle quelle.
    if (status === 401 && skipRefresh) {
      const msg = getErrorMessage(err);
      return Promise.reject(new Error(msg));
    }

    // 401 sur une route métier = accessToken expiré → tenter UN refresh
    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        await refreshSession();
        return apiClient(originalConfig);
      } catch {
        onUnauthorized?.();
        return Promise.reject(
          new Error('Session expirée. Veuillez vous reconnecter.')
        );
      }
    }

    // 403 : accès refusé (compte désactivé, rôle insuffisant)
    if (status === 403) {
      onUnauthorized?.();
    }

    const msg = getErrorMessage(err);
    return Promise.reject(new Error(msg));
  }
);

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

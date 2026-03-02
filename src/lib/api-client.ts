'use client';

import axios, { AxiosError } from 'axios';
import CryptoJS from 'crypto-js';
import { getErrorMessage } from '@/lib/utils/errors';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-me';

type TokenData = { accessToken: string; refreshToken: string };

function getLocalTokenData(): TokenData {
  if (typeof window === 'undefined') return { accessToken: '', refreshToken: '' };
  const encrypted = localStorage.getItem('encryptedAuthToken');
  if (!encrypted) return { accessToken: '', refreshToken: '' };

  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const serialized = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(serialized) as TokenData;
  } catch {
    return { accessToken: '', refreshToken: '' };
  }
}

function setLocalTokenData(accessToken: string, refreshToken: string): void {
  const serialized = JSON.stringify({ accessToken, refreshToken });
  const encrypted = CryptoJS.AES.encrypt(serialized, ENCRYPTION_KEY).toString();
  localStorage.setItem('encryptedAuthToken', encrypted);
}

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized: (() => void) | null = null;

export function setApiUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = getLocalTokenData();
    if (accessToken) {
      config.headers['x-access-token'] = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalConfig = err.config as typeof err.config & { _retry?: boolean };

    if (err.response?.status === 401 && !originalConfig?._retry) {
      originalConfig._retry = true;

      try {
        const { refreshToken } = getLocalTokenData();
        const { data } = await apiClient.post<{ accessToken: string; refreshToken: string }>(
          '/auth/refreshtoken',
          { refreshToken }
        );
        apiClient.defaults.headers.common['x-access-token'] = data.accessToken;
        setLocalTokenData(data.accessToken, data.refreshToken);
        return apiClient(originalConfig!);
      } catch (refreshErr) {
        onUnauthorized?.();
        const msg = getErrorMessage(refreshErr);
        return Promise.reject(new Error(msg));
      }
    }

    if (err.response?.status === 403) {
      onUnauthorized?.();
    }

    const msg = getErrorMessage(err);
    return Promise.reject(new Error(msg));
  }
);

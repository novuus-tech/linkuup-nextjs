'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { clear } from '@/lib/store/slices/alertSlice';

export function Alert() {
  const { message, type } = useSelector((state: RootState) => state.alert);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => dispatch(clear()), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="mx-auto max-w-7xl py-2">
      <div
        className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${
          isSuccess
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(clear())}
          className="rounded-lg p-1.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

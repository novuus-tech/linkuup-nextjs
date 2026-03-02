'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { clear } from '@/lib/store/slices/alertSlice';

const DURATION = 5000;

export function Alert() {
  const { message, type } = useSelector((state: RootState) => state.alert);
  const dispatch = useDispatch<AppDispatch>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dispatch(clear()), 300);
      }, DURATION);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, dispatch]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="mx-auto max-w-7xl py-2">
      <div
        className={`relative overflow-hidden transition-all duration-300 ${
          visible ? 'animate-slide-down opacity-100' : 'opacity-0 -translate-y-2'
        } flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${
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
          onClick={() => {
            setVisible(false);
            setTimeout(() => dispatch(clear()), 300);
          }}
          className="rounded-lg p-1.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div
            className={`h-full ${isSuccess ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-red-400 dark:bg-red-500'}`}
            style={{
              animation: `progress-shrink ${DURATION}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

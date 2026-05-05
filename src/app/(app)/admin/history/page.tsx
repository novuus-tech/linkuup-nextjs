'use client';

import Link from 'next/link';
import { ActivityLogList } from '@/components/admin/ActivityLogList';
import { Button } from '@/components/ui/button';

export default function AdminHistoryPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Historique des actions
            </h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Qui a fait quoi, quand et sur quoi · Journal d&rsquo;audit complet et immuable
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Retour à l&rsquo;admin
            </Button>
          </Link>
        </div>
      </div>

      <ActivityLogList />
    </div>
  );
}

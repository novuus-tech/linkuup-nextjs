'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUsers, useDeleteUser, useToggleUserActive } from '@/lib/hooks/useUsers';
import { success } from '@/lib/store/slices/alertSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { getInputClass } from '@/lib/utils/input';
import { formatRoleLabel } from '@/lib/utils/format';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { SkeletonTable, SkeletonStatCards } from '@/components/ui/Skeleton';

type UserRow = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  roles?: string[];
};

export function UsersList() {
  const [filterRole, setFilterRole] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, isError, error } = useUsers();
  const deleteMutation = useDeleteUser();
  const toggleActiveMutation = useToggleUserActive();

  const users = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? (data as { users?: unknown[] })?.users ?? [];

  const filteredUsers = useMemo(() => {
    if (!filterRole) return users as UserRow[];
    return (users as UserRow[]).filter((u) =>
      (u.roles ?? []).some((r) => r.toLowerCase().includes(filterRole.toLowerCase()))
    );
  }, [users, filterRole]);

  // Stats
  const stats = useMemo(() => {
    const all = users as UserRow[];
    const total = all.length;
    const active = all.filter(u => u.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggleActive = async (user: UserRow) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: user.id,
        isActive: !user.isActive,
      });
      dispatch(
        success(
          user.isActive
            ? 'Utilisateur desactive'
            : 'Utilisateur active'
        )
      );
    } catch {
      // Erreur geree par MutationCache
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-40" />
            <div className="skeleton mt-2 h-4 w-56" />
          </div>
        </div>
        <SkeletonStatCards count={3} />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Utilisateurs
        </h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          <p className="font-medium">Erreur lors du chargement des utilisateurs</p>
          <p className="mt-1 text-sm">
            {(error as Error)?.message ?? 'Une erreur est survenue.'}
          </p>
        </div>
      </div>
    );
  }

  const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98]';

  return (
    <div className="space-y-6">
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Utilisateurs
          </h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {"Gerer les comptes et les roles"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={getInputClass()}
          >
            <option value="">Tous les utilisateurs</option>
            <option value="commercial">Commerciaux</option>
            <option value="admin">Administrateurs</option>
            <option value="moderator">{"Moderateurs"}</option>
            <option value="user">Utilisateurs</option>
          </select>
          <Link href="/users/add" className={`${btnPrimary} shrink-0`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvel utilisateur
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          label="Total"
          value={stats.total}
          color="indigo"
          delay={1}
        />
        <StatCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Actifs"
          value={stats.active}
          color="emerald"
          delay={2}
        />
        <StatCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
          label="Inactifs"
          value={stats.inactive}
          color="red"
          delay={3}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Utilisateur
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Email
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Statut
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  {"Roles"}
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title={"Aucun utilisateur trouve"}
                      description={"Modifiez vos filtres ou ajoutez un nouvel utilisateur."}
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row-hover">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-xs font-bold text-white">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        disabled={toggleActiveMutation.isPending}
                        className={`inline-flex cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-50 ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                        title={user.isActive ? 'Cliquer pour desactiver' : 'Cliquer pour activer'}
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {(user.roles ?? []).map((role) => (
                          <span
                            key={role}
                            className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          >
                            {formatRoleLabel(role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-3">
                        <Link
                          href={`/users/edit/${user.id}`}
                          className="inline-flex items-center gap-1 font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Modifier
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1 font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer cet utilisateur ?"
        message={`Cette action est irreversible. L'utilisateur ${deleteTarget?.firstName} ${deleteTarget?.lastName} sera definitivement supprime.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

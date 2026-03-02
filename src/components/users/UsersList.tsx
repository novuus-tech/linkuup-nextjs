'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUsers, useDeleteUser, useToggleUserActive } from '@/lib/hooks/useUsers';
import { success } from '@/lib/store/slices/alertSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { getInputClass } from '@/lib/utils/input';
import { formatRoleLabel } from '@/lib/utils/format';

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      await deleteMutation.mutateAsync(id);
    }
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
            ? 'Utilisateur désactivé'
            : 'Utilisateur activé'
        )
      );
    } catch {
      // Erreur gérée par MutationCache
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Gérer les comptes et les rôles
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
            <option value="moderator">Modérateurs</option>
            <option value="user">Utilisateurs</option>
          </select>
          <Link href="/users/add" className={`${btnPrimary} shrink-0`}>
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nouvel utilisateur
        </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Prénom
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Nom
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Email
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Statut
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Rôles
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-500 dark:text-gray-400"
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-indigo-50/50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {user.firstName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">
                      {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        disabled={toggleActiveMutation.isPending}
                        className={`inline-flex cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-50 ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                        title={user.isActive ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link
                          href={`/users/edit/${user.id}`}
                          className="font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Modifier
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteMutation.isPending}
                          className="font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                        >
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
    </div>
  );
}

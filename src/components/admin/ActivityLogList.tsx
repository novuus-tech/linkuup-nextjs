'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useActivity } from '@/lib/hooks/useActivity';
import type {
  ActivityAction,
  ActivityFilters,
  ActivityLogEntry,
  ActivityTargetType,
} from '@/lib/api/activity';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

dayjs.locale('fr');
dayjs.extend(relativeTime);

const ACTION_LABELS: Record<ActivityAction, string> = {
  created: 'Créé',
  updated: 'Modifié',
  deleted: 'Supprimé',
  activated: 'Activé',
  deactivated: 'Désactivé',
};

const ACTION_STYLES: Record<ActivityAction, string> = {
  created: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
  updated: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300',
  activated: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
  deactivated: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
};

const TARGET_LABELS: Record<ActivityTargetType, string> = {
  Appointment: 'Rendez-vous',
  User: 'Utilisateur',
};

const TARGET_ICONS: Record<ActivityTargetType, React.ReactNode> = {
  Appointment: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  User: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const FIELD_LABELS: Record<string, string> = {
  date: 'Date',
  time: 'Heure',
  name: 'Nom',
  phone_1: 'Téléphone fixe',
  phone_2: 'Téléphone mobile',
  address: 'Adresse',
  commercial: 'Commercial',
  comment: 'Commentaire',
  status: 'Statut',
  reminderDate: 'Date de rappel',
  firstName: 'Prénom',
  lastName: 'Nom',
  email: 'Email',
  roles: 'Rôles',
  isActive: 'Actif',
  password: 'Mot de passe',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  'not-interested': 'Non intéressé',
  'to-be-reminded': 'À rappeler',
  'longest-date': 'Date éloignée',
};

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '∅';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (field === 'status' && typeof value === 'string') {
    return STATUS_LABELS[value] ?? value;
  }
  return String(value);
}

function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

function ActorCell({ entry }: { entry: ActivityLogEntry }) {
  const name = entry.actorId
    ? `${entry.actorId.firstName ?? ''} ${entry.actorId.lastName ?? ''}`.trim()
    : entry.actorLabel;
  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-emerald-600 text-xs font-semibold text-white">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {name || 'Système'}
        </p>
        {entry.actorId?.email && (
          <p className="truncate text-xs text-zinc-500">{entry.actorId.email}</p>
        )}
      </div>
    </div>
  );
}

function ChangesCell({ entry }: { entry: ActivityLogEntry }) {
  const changes = Object.entries(entry.changes ?? {});

  if (entry.action === 'created') {
    return <span className="text-xs text-zinc-500 italic">Création</span>;
  }
  if (entry.action === 'deleted') {
    return <span className="text-xs text-red-600 italic dark:text-red-400">Suppression</span>;
  }
  if (entry.action === 'activated') {
    return <span className="text-xs text-emerald-600 italic dark:text-emerald-400">Compte activé</span>;
  }
  if (entry.action === 'deactivated') {
    return <span className="text-xs text-amber-600 italic dark:text-amber-400">Compte désactivé</span>;
  }

  if (changes.length === 0) {
    return <span className="text-xs text-zinc-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {changes.slice(0, 3).map(([field, { from, to }]) => (
        <span
          key={field}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-800/60"
          title={`${fieldLabel(field)}: ${formatValue(field, from)} → ${formatValue(field, to)}`}
        >
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {fieldLabel(field)}
          </span>
          <span className="text-zinc-400">·</span>
          <span className="max-w-[110px] truncate text-zinc-500 line-through">
            {formatValue(field, from)}
          </span>
          <svg className="h-3 w-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="max-w-[110px] truncate font-medium text-emerald-700 dark:text-emerald-400">
            {formatValue(field, to)}
          </span>
        </span>
      ))}
      {changes.length > 3 && (
        <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60">
          +{changes.length - 3} autres
        </span>
      )}
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onChange: (next: number) => void;
}

function Pagination({ page, totalPages, hasNext, hasPrev, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-xs text-zinc-500">
        Page <span className="font-semibold text-zinc-700 dark:text-zinc-200">{page}</span> sur{' '}
        <span className="font-semibold text-zinc-700 dark:text-zinc-200">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={!hasPrev}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ← Précédent
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={!hasNext}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

export function ActivityLogList() {
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    limit: 25,
    action: '',
    targetType: '',
    q: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, isError, error } = useActivity(filters);

  const docs = useMemo(() => data?.docs ?? [], [data]);
  const totalDocs = data?.totalDocs ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPrevPage = data?.hasPrevPage ?? false;
  const currentPage = data?.page ?? 1;

  function update<K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) {
    setFilters((prev) => {
      if (key === 'page') {
        return { ...prev, page: value as number };
      }
      return { ...prev, [key]: value, page: 1 };
    });
  }

  function reset() {
    setFilters({
      page: 1,
      limit: 25,
      action: '',
      targetType: '',
      q: '',
      startDate: '',
      endDate: '',
    });
  }

  const hasActiveFilters =
    filters.action || filters.targetType || filters.q || filters.startDate || filters.endDate;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Filtres */}
      <div className="border-b border-zinc-200 bg-zinc-50/60 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Recherche"
            placeholder="Nom, email, libellé…"
            value={filters.q ?? ''}
            onChange={(e) => update('q', e.target.value)}
          />
          <Select
            label="Action"
            value={filters.action ?? ''}
            onChange={(e) => update('action', e.target.value as ActivityAction | '')}
          >
            <option value="">Toutes</option>
            <option value="created">Créé</option>
            <option value="updated">Modifié</option>
            <option value="deleted">Supprimé</option>
            <option value="activated">Activé</option>
            <option value="deactivated">Désactivé</option>
          </Select>
          <Select
            label="Type"
            value={filters.targetType ?? ''}
            onChange={(e) => update('targetType', e.target.value as ActivityTargetType | '')}
          >
            <option value="">Tous</option>
            <option value="Appointment">Rendez-vous</option>
            <option value="User">Utilisateur</option>
          </Select>
          <Input
            label="Du"
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => update('startDate', e.target.value)}
          />
          <Input
            label="Au"
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => update('endDate', e.target.value)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {isLoading ? (
              'Chargement…'
            ) : (
              <>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  {totalDocs}
                </span>{' '}
                {totalDocs > 1 ? 'événements' : 'événement'}
              </>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="py-12">
          <Spinner size="lg" label="Chargement de l'historique…" />
        </div>
      ) : isError ? (
        <div className="px-5 py-12 text-center text-sm text-red-600 dark:text-red-400">
          {(error as Error)?.message ?? 'Impossible de charger l\u2019historique.'}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Aucun événement"
          description="Essayez d'ajuster les filtres ou attendez de nouvelles actions."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/60 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <th className="px-5 py-3">Quand</th>
                  <th className="px-5 py-3">Qui</th>
                  <th className="px-5 py-3">A fait</th>
                  <th className="px-5 py-3">Sur</th>
                  <th className="px-5 py-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {docs.map((entry) => (
                  <tr
                    key={entry._id}
                    className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-5 py-3 align-top">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {dayjs(entry.createdAt).format('DD/MM/YYYY')}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {dayjs(entry.createdAt).format('HH:mm')}
                      </p>
                      <p
                        className="mt-0.5 text-[10px] text-zinc-400"
                        title={dayjs(entry.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                      >
                        {dayjs(entry.createdAt).fromNow()}
                      </p>
                    </td>
                    <td className="px-5 py-3 align-top">
                      <ActorCell entry={entry} />
                    </td>
                    <td className="px-5 py-3 align-top">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_STYLES[entry.action]}`}
                      >
                        {ACTION_LABELS[entry.action]}
                      </span>
                    </td>
                    <td className="px-5 py-3 align-top">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {TARGET_ICONS[entry.targetType]}
                          {TARGET_LABELS[entry.targetType]}
                        </span>
                        <p className="max-w-xs truncate text-sm text-zinc-700 dark:text-zinc-200">
                          {entry.targetLabel || `#${entry.targetId.slice(-6)}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 align-top">
                      <ChangesCell entry={entry} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue mobile */}
          <div className="divide-y divide-zinc-100 md:hidden dark:divide-zinc-800/60">
            {docs.map((entry) => (
              <div key={entry._id} className="px-4 py-3.5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <ActorCell entry={entry} />
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_STYLES[entry.action]}`}
                  >
                    {ACTION_LABELS[entry.action]}
                  </span>
                </div>
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {TARGET_ICONS[entry.targetType]}
                    {TARGET_LABELS[entry.targetType]}
                  </span>
                  <p className="truncate text-sm text-zinc-700 dark:text-zinc-200">
                    {entry.targetLabel || `#${entry.targetId.slice(-6)}`}
                  </p>
                </div>
                <ChangesCell entry={entry} />
                <p className="mt-2 text-[10px] text-zinc-400">
                  {dayjs(entry.createdAt).format('DD/MM/YYYY HH:mm')} ·{' '}
                  {dayjs(entry.createdAt).fromNow()}
                </p>
              </div>
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            hasNext={hasNextPage}
            hasPrev={hasPrevPage}
            onChange={(next) => update('page', next)}
          />
        </>
      )}
    </div>
  );
}

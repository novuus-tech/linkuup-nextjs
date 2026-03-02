export const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  'not-interested': 'Non intéressé',
  'to-be-reminded': 'À rappeler',
  'longest-date': 'Date éloignée',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'text-emerald-800 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30',
  confirmed: 'text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
  cancelled: 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/30',
  'not-interested': 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-700/50',
  'to-be-reminded': 'text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30',
  'longest-date': 'text-violet-800 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/30',
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? '';
}

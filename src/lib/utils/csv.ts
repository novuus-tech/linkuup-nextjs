import dayjs from 'dayjs';
import { getStatusLabel } from './status';
import { formatCommercialName } from './format';

interface AppointmentDoc {
  userId?: { firstName?: string };
  createdAt?: string;
  name?: string;
  phone_1?: string;
  phone_2?: string;
  address?: string;
  date?: string;
  time?: string;
  commercial?: string;
  status?: string;
}

interface AppointmentsData {
  docs?: AppointmentDoc[];
}

/**
 * Échappe une valeur pour CSV (RFC 4180).
 * Les champs contenant , " ou \n sont entourés de guillemets.
 */
function escapeCsvField(value: string): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadAsCSV(
  appointments: AppointmentsData,
  selectedDate?: string
): Blob {
  const docs = appointments?.docs ?? [];
  const headers = [
    'Agent',
    'Date création',
    'Nom',
    'Téléphone (fixe)',
    'Téléphone (mobile)',
    'Adresse',
    'Date programmation',
    'Heure programmation',
    'Commercial',
    'Statut',
  ].map(escapeCsvField).join(',');

  const rows = docs.map((item) =>
    [
      item.userId?.firstName ?? '',
      dayjs(item.createdAt).format('DD/MM/YYYY HH:mm'),
      item.name ?? '',
      item.phone_1 ?? '',
      item.phone_2 ?? '',
      item.address ?? '',
      dayjs(item.date).format('DD/MM/YYYY'),
      item.time ?? '',
      item.commercial ? formatCommercialName(item.commercial) : '',
      getStatusLabel(item.status ?? ''),
    ]
      .map(escapeCsvField)
      .join(',')
  );

  const csvContent = [headers, ...rows].join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${selectedDate ?? 'appointments'}-appointments.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  return blob;
}

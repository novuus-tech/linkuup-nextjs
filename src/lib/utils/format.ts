const ROLE_LABELS: Record<string, string> = {
  ROLE_USER: 'Utilisateur',
  ROLE_MODERATOR: 'Modérateur',
  ROLE_ADMIN: 'Administrateur',
  ROLE_COMMERCIAL: 'Commercial',
};

export function formatRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role.replace(/^ROLE_/, '').replace(/_/g, ' ');
}

export function formatCommercialName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

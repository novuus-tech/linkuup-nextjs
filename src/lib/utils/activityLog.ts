import type { NextRequest } from 'next/server';
import ActivityLog from '@/lib/models/ActivityLog';
import User from '@/lib/models/User';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'activated'
  | 'deactivated';

export type ActivityTargetType = 'Appointment' | 'User';

export type ChangeMap = Record<string, { from: unknown; to: unknown }>;

interface LogActivityParams {
  req?: NextRequest;
  actorId?: string;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  targetLabel?: string;
  changes?: ChangeMap;
}

const SENSITIVE_FIELDS = new Set(['password']);

/**
 * Calcule le diff entre deux objets pour les champs spécifiés.
 * Compare via String() pour gérer les types primitifs et dates.
 */
export function buildChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown>,
  fields: string[]
): ChangeMap {
  const changes: ChangeMap = {};
  for (const field of fields) {
    if (SENSITIVE_FIELDS.has(field)) continue;
    const prev = before?.[field];
    const next = after[field];
    if (next === undefined) continue;
    if (String(prev ?? '') !== String(next ?? '')) {
      changes[field] = { from: prev ?? null, to: next ?? null };
    }
  }
  return changes;
}

/** Récupère un libellé lisible pour un acteur (snapshot dénormalisé). */
async function resolveActorLabel(actorId?: string): Promise<string | undefined> {
  if (!actorId) return undefined;
  try {
    const user = await User.findById(actorId).select('firstName lastName email').lean<{
      firstName?: string;
      lastName?: string;
      email?: string;
    }>().exec();
    if (!user) return undefined;
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || user.email || undefined;
  } catch {
    return undefined;
  }
}

function getClientIp(req?: NextRequest): string | undefined {
  if (!req) return undefined;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim();
  return req.headers.get('x-real-ip') ?? undefined;
}

/**
 * Enregistre une entrée dans le journal d'audit.
 * Ne lève jamais d'exception — un échec d'audit ne doit pas faire échouer la requête métier.
 */
export async function logActivity({
  req,
  actorId,
  action,
  targetType,
  targetId,
  targetLabel,
  changes,
}: LogActivityParams): Promise<void> {
  try {
    const actorLabel = await resolveActorLabel(actorId);
    await ActivityLog.create({
      actorId: actorId || undefined,
      actorLabel,
      action,
      targetType,
      targetId,
      targetLabel,
      changes: changes ?? {},
      ip: getClientIp(req),
    });
  } catch (err) {
    console.error('[activityLog] failed to write audit entry:', err);
  }
}

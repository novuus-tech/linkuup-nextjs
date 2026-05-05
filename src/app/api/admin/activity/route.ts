import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ActivityLog from '@/lib/models/ActivityLog';
import '@/lib/models/User';
import { requireAdmin } from '@/lib/auth';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const VALID_ACTIONS = new Set([
  'created',
  'updated',
  'deleted',
  'activated',
  'deactivated',
]);
const VALID_TARGETS = new Set(['Appointment', 'User']);

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Math.max(
      parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE,
      1
    );
    const limit = Math.min(
      Math.max(
        parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
        1
      ),
      MAX_LIMIT
    );

    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const actorId = searchParams.get('actorId');
    const targetId = searchParams.get('targetId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const q = searchParams.get('q')?.trim();

    const query: Record<string, unknown> = {};

    if (action && VALID_ACTIONS.has(action)) query.action = action;
    if (targetType && VALID_TARGETS.has(targetType)) query.targetType = targetType;
    if (actorId) query.actorId = actorId;
    if (targetId) query.targetId = targetId;

    if (startDate || endDate) {
      const range: Record<string, Date> = {};
      if (startDate) range.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        range.$lt = end;
      }
      query.createdAt = range;
    }

    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { targetLabel: { $regex: safe, $options: 'i' } },
        { actorLabel: { $regex: safe, $options: 'i' } },
      ];
    }

    const result = await (
      ActivityLog as unknown as {
        paginate: (q: object, o: object) => Promise<unknown>;
      }
    ).paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'actorId', select: 'firstName lastName email' },
      lean: true,
    });

    return NextResponse.json({ activity: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('authentifié') || msg.includes('rôle') ? 403 : 500 }
    );
  }
}

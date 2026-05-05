import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { requireAdmin, requireAdminOrModerator, requireAuth } from '@/lib/auth';
import { buildChanges, logActivity } from '@/lib/utils/activityLog';

const EDITABLE_FIELDS = [
  'date',
  'time',
  'name',
  'phone_1',
  'phone_2',
  'address',
  'commercial',
  'comment',
  'status',
  'reminderDate',
] as const;

interface AppointmentLean {
  _id: { toString: () => string };
  name?: string;
  date?: string;
  time?: string;
  status?: string;
  [key: string]: unknown;
}

function buildLabel(apt: AppointmentLean | null | undefined): string {
  if (!apt) return '';
  return `${apt.name ?? '—'} — ${apt.date ?? ''} ${apt.time ?? ''}`.trim();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req);
    await connectDB();

    const { id } = await params;
    const appointment = await Appointment.findById(id)
      .populate({ path: 'userId', select: 'firstName lastName' })
      .exec();

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') ? 403 : 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: actorId } = await requireAdminOrModerator(req);
    await connectDB();

    const { id } = await params;
    const data = await req.json();

    const update: Record<string, unknown> = {};
    for (const f of EDITABLE_FIELDS) {
      if (data[f] !== undefined) update[f] = data[f];
    }

    const before = await Appointment.findById(id).lean<AppointmentLean>().exec();
    if (!before) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = await Appointment.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    const changes = buildChanges(
      before as Record<string, unknown>,
      update,
      Object.keys(update)
    );

    if (Object.keys(changes).length > 0) {
      await logActivity({
        req,
        actorId,
        action: 'updated',
        targetType: 'Appointment',
        targetId: id,
        targetLabel: buildLabel(before),
        changes,
      });
    }

    return NextResponse.json({ appointment });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') || msg.includes('role') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: actorId } = await requireAdmin(req);
    await connectDB();

    const { id } = await params;
    const before = await Appointment.findById(id).lean<AppointmentLean>().exec();
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    await logActivity({
      req,
      actorId,
      action: 'deleted',
      targetType: 'Appointment',
      targetId: id,
      targetLabel: buildLabel(before),
      changes: {},
    });

    return NextResponse.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') || msg.includes('role') ? 403 : 500 }
    );
  }
}

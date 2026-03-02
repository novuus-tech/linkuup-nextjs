import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import connectDB from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { requireAuth } from '@/lib/auth';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get('week');
    if (!weekParam) {
      return NextResponse.json(
        { success: false, message: 'Week parameter required (e.g. 2024-W12)' },
        { status: 400 }
      );
    }

    const [yearStr, weekStr] = weekParam.split('-W');
    const year = parseInt(yearStr, 10);
    const weekNum = parseInt(weekStr, 10);

    const startDate = dayjs().year(year).isoWeek(weekNum).startOf('isoWeek');
    const endDate = dayjs().year(year).isoWeek(weekNum).endOf('isoWeek');

    // Rendez-vous pris (créés) par l'agent pendant la semaine, pas la date programmée
    const appointments = await Appointment.find({
      createdAt: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    })
      .populate('userId', 'firstName')
      .exec();

    const byUser = new Map<string, { name: string; week: number[] }>();

    appointments.forEach((apt) => {
      const name = (apt.userId as { firstName?: string })?.firstName ?? 'Unknown';
      if (!byUser.has(name)) {
        byUser.set(name, { name, week: Array(7).fill(0) });
      }
      // Jour de la semaine (0 = dimanche, 1 = lundi, ...) de la date de création
      const createdDate = dayjs((apt as { createdAt?: Date }).createdAt);
      const dayOfWeek = createdDate.day();
      byUser.get(name)!.week[dayOfWeek]++;
    });

    const employees = Array.from(byUser.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({ employees });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') ? 403 : 500 }
    );
  }
}

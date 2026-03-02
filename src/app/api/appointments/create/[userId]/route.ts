import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAuth(req);
    await connectDB();

    const { userId } = await params;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const data = await req.json();
    const { date, time, name, phone_1, phone_2, address, comment, commercial } = data;

    if (!date || !time || !name) {
      return NextResponse.json(
        { success: false, message: 'Date, time and name are required' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.create({
      userId,
      date,
      time,
      name,
      phone_1: phone_1 || '',
      phone_2: phone_2 || '',
      address: address || '',
      comment: comment || '',
      commercial: commercial || '',
    });

    return NextResponse.json({ appointment });
  } catch (err) {
    console.error('Create appointment error:', err);
    const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
    const status = msg.includes('token') || msg.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json(
      { success: false, message: msg },
      { status }
    );
  }
}

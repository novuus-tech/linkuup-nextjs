import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { _id } = await req.json();
    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 400 }
      );
    }

    // Logout = invalidation côté client (suppression des tokens).
    // On ne modifie pas isActive : ce champ indique si le compte est autorisé à se connecter.
    return NextResponse.json({ success: true, message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

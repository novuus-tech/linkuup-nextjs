import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RefreshToken from '@/lib/models/RefreshToken';
import { requireAuth } from '@/lib/auth';

const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req);
    await connectDB();

    await RefreshToken.deleteMany({ user: userId }).exec();

    const response = NextResponse.json({
      success: true,
      message: 'Toutes vos sessions ont été déconnectées.',
    });

    const expired = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    };
    response.cookies.set('accessToken', '', expired);
    response.cookies.set('refreshToken', '', expired);
    return response;
  } catch (err) {
    if (err instanceof Error && (err.message.includes('authentifié') || err.message.includes('introuvable'))) {
      return NextResponse.json({ success: false, message: 'Non authentifié.' }, { status: 401 });
    }
    console.error('Logout all error:', err);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

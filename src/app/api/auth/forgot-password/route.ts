import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { checkRateLimit } from '@/lib/rateLimit';

const schema = z.object({
  email: z.string().email(),
});

// Always return the same message to prevent email enumeration
const SUCCESS_MSG = 'Si votre adresse est enregistrée, vous recevrez un lien de réinitialisation.';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = checkRateLimit(`forgot:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    // Return 200 to avoid leaking rate limit info
    return NextResponse.json({ success: true, message: SUCCESS_MSG });
  }

  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: true, message: SUCCESS_MSG });
    }

    const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).exec();
    if (!user) {
      return NextResponse.json({ success: true, message: SUCCESS_MSG });
    }

    // Generate a secure random token — store its SHA-256 hash in the DB
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/auth/reset-password?token=${plainToken}`;

    // TODO: Integrate an email service (Resend, SendGrid, Nodemailer…) to send resetUrl
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔑 Lien de réinitialisation (dev only):', resetUrl, '\n');
    }

    return NextResponse.json({ success: true, message: SUCCESS_MSG });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import RefreshToken from '@/lib/models/RefreshToken';

const schema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Données invalides.';
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Hash the incoming token to compare with the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: new Date() },
    }).exec();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Lien invalide ou expiré. Veuillez faire une nouvelle demande.' },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    // Invalidate all existing sessions for this account
    await RefreshToken.deleteMany({ user: user._id }).exec();

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour. Vous pouvez maintenant vous connecter.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

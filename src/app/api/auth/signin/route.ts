import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import RefreshToken from '@/lib/models/RefreshToken';
import { initRoles } from '@/lib/initRoles';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_ACCESS_LIFETIME = parseInt(process.env.JWT_LIFETIME_ACCESS || '3600', 10);
const JWT_REFRESH_LIFETIME = parseInt(process.env.JWT_LIFETIME_REFRESH || '86400', 10);

function createAccessToken(userId: string) {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: JWT_ACCESS_LIFETIME }
  );
}

export async function POST(req: NextRequest) {
  try {
    await initRoles();
    await connectDB();

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).populate('roles', '-__v').exec();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: 'Compte désactivé. Contactez l\'administrateur.' },
        { status: 403 }
      );
    }

    user.isActive = true;
    await user.save();

    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = await (RefreshToken as unknown as { createToken: (u: { _id: unknown }) => Promise<string> }).createToken(user);

    const authorities = user.roles.map((r: { name: string }) => `ROLE_${(r as { name: string }).name.toUpperCase()}`);

    return NextResponse.json({
      success: true,
      userlog: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      roles: authorities,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('Signin error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

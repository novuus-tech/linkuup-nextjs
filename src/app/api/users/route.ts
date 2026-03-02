import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

function formatUserWithRoles(user: {
  _id: { toString: () => string };
  firstName: string;
  lastName: string;
  email: string;
  roles: { name: string }[];
  isActive?: boolean;
}) {
  const authorities = user.roles.map((r) => `ROLE_${r.name.toUpperCase()}`);
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roles: authorities,
    isActive: user.isActive,
  };
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectDB();

    const users = await User.find().populate('roles', '-__v').exec();
    const formatted = users.map((u) => formatUserWithRoles(u as never));

    return NextResponse.json(formatted);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') || msg.includes('role') ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectDB();

    const data = await req.json();
    const { firstName, lastName, email, password, roles } = data;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email already taken' },
        { status: 400 }
      );
    }

    const roleNames = roles?.length ? roles : ['user'];
    const roleDocs = await Role.find({ name: { $in: roleNames } });
    if (roleDocs.length !== roleNames.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid roles' },
        { status: 400 }
      );
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password, SALT_ROUNDS),
      roles: roleDocs.map((r) => r._id),
      isActive: true,
    });
    await user.save();

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') || msg.includes('role') ? 403 : 500 }
    );
  }
}

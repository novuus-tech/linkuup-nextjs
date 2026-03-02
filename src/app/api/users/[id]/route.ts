import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import { requireAdmin, requireAuth } from '@/lib/auth';
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req);
    await connectDB();

    const { id } = await params;
    const user = await User.findById(id).populate('roles', '-__v').exec();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatUserWithRoles(user as never));
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
    await requireAdmin(req);
    await connectDB();

    const { id } = await params;
    const data = await req.json();

    const update: Record<string, unknown> = {};
    if (data.firstName !== undefined) update.firstName = data.firstName;
    if (data.lastName !== undefined) update.lastName = data.lastName;
    if (data.email !== undefined) update.email = data.email;
    if (data.isActive !== undefined) update.isActive = data.isActive;

    if (data.roles?.length) {
      const roles = await Role.find({ name: { $in: data.roles } });
      update.roles = roles.map((r) => r._id);
    }

    if (data.password?.trim()) {
      update.password = bcrypt.hashSync(data.password, SALT_ROUNDS);
    }

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('roles', '-__v')
      .exec();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
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
    await requireAdmin(req);
    await connectDB();

    const { id } = await params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') || msg.includes('role') ? 403 : 500 }
    );
  }
}

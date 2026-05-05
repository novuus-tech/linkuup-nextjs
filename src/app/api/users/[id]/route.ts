import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { buildChanges, logActivity } from '@/lib/utils/activityLog';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().max(254).toLowerCase().optional(),
  password: z.string().min(8).max(128).optional().or(z.literal('')),
  roles: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

function formatUserWithRoles(user: {
  _id: { toString: () => string };
  firstName: string;
  lastName: string;
  email: string;
  roles: { name: string }[];
  isActive?: boolean;
  createdAt?: Date;
}) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roles: user.roles.map((r) => `ROLE_${r.name.toUpperCase()}`),
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

interface UserLean {
  _id: { toString: () => string };
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  roles?: { _id: { toString: () => string }; name: string }[];
}

function userLabel(u: UserLean | null | undefined): string {
  if (!u) return '';
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  return name ? `${name} (${u.email ?? ''})` : u.email ?? '';
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
      return NextResponse.json({ success: false, message: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(formatUserWithRoles(user as never));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ success: false, message: msg }, { status: msg.includes('token') ? 403 : 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: actorId } = await requireAdmin(req);
    await connectDB();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Données invalides', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, roles, isActive } = parsed.data;
    const update: Record<string, unknown> = {};

    if (firstName !== undefined) update.firstName = firstName;
    if (lastName !== undefined) update.lastName = lastName;
    if (isActive !== undefined) update.isActive = isActive;

    if (email !== undefined) {
      const conflict = await User.findOne({ email, _id: { $ne: id } });
      if (conflict) {
        return NextResponse.json({ success: false, message: 'Cet email est déjà utilisé par un autre compte.' }, { status: 409 });
      }
      update.email = email;
    }

    if (roles?.length) {
      const roleDocs = await Role.find({ name: { $in: roles } });
      if (roleDocs.length !== roles.length) {
        return NextResponse.json({ success: false, message: 'Rôle(s) invalide(s).' }, { status: 400 });
      }
      update.roles = roleDocs.map((r) => r._id);
    }

    if (password && password.trim()) {
      update.password = bcrypt.hashSync(password.trim(), SALT_ROUNDS);
    }

    const before = await User.findById(id)
      .populate('roles', 'name')
      .lean<UserLean>()
      .exec();

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('roles', '-__v')
      .exec();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Utilisateur introuvable' }, { status: 404 });
    }

    const trackedFields = ['firstName', 'lastName', 'email', 'isActive'];
    const changes = buildChanges(
      before as Record<string, unknown> | null,
      update,
      trackedFields
    );

    if (roles?.length && before?.roles) {
      const prevRoles = before.roles.map((r) => r.name).sort();
      const nextRoles = [...roles].sort();
      if (prevRoles.join(',') !== nextRoles.join(',')) {
        changes.roles = { from: prevRoles, to: nextRoles };
      }
    }

    if (password && password.trim()) {
      changes.password = { from: '••••••', to: '••••••' };
    }

    let action: 'updated' | 'activated' | 'deactivated' = 'updated';
    if (
      isActive !== undefined &&
      before?.isActive !== isActive &&
      Object.keys(changes).length === 1 &&
      changes.isActive
    ) {
      action = isActive ? 'activated' : 'deactivated';
    }

    if (Object.keys(changes).length > 0) {
      await logActivity({
        req,
        actorId,
        action,
        targetType: 'User',
        targetId: id,
        targetLabel: userLabel(before),
        changes,
      });
    }

    return NextResponse.json({ success: true, message: 'Utilisateur mis à jour avec succès.', user: formatUserWithRoles(user as never) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    return NextResponse.json({ success: false, message: msg }, { status: msg.includes('authentifié') || msg.includes('rôle') ? 403 : 500 });
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
    const before = await User.findById(id).lean<UserLean>().exec();
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Utilisateur introuvable' }, { status: 404 });
    }

    await logActivity({
      req,
      actorId,
      action: 'deleted',
      targetType: 'User',
      targetId: id,
      targetLabel: userLabel(before),
      changes: {},
    });

    return NextResponse.json({ success: true, message: 'Utilisateur supprimé avec succès.' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    return NextResponse.json({ success: false, message: msg }, { status: msg.includes('authentifié') ? 403 : 500 });
  }
}

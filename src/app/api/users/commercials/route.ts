import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import { requireAuth } from '@/lib/auth';
import { removeAccents } from '@/lib/utils/format';

const toCommercialSlug = (name: string) =>
  removeAccents(name.toLowerCase().replace(/\s+/g, '-'));

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    await connectDB();

    const commercialRole = await Role.findOne({ name: 'commercial' }).exec();
    if (!commercialRole) {
      return NextResponse.json([]);
    }

    const users = await User.find({
      roles: commercialRole._id,
      isActive: { $ne: false },
    })
      .select('firstName lastName')
      .sort({ lastName: 1, firstName: 1 })
      .lean()
      .exec();

    const commercials = users.map((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.trim();
      return {
        id: (u as { _id: { toString: () => string } })._id.toString(),
        fullName,
        slug: toCommercialSlug(fullName),
      };
    });

    return NextResponse.json(commercials);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { success: false, message: msg },
      { status: msg.includes('token') ? 403 : 500 }
    );
  }
}

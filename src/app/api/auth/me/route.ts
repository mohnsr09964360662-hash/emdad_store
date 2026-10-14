// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request);

  if (!session) {
    return NextResponse.json(
      { authenticated: false, message: 'غير مسجل الدخول' },
      { status: 401 }
    );
  }

  let admin = null;
  try {
    admin = await prisma.adminUser.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch (err) {
    console.warn('[API /api/auth/me] DB lookup notice:', err);
  }

  const user = admin || {
    id: session.sub,
    email: session.email,
    name: session.name || 'مدير المتجر',
    role: session.role || 'ADMIN',
  };

  return NextResponse.json({
    authenticated: true,
    user,
  });
}

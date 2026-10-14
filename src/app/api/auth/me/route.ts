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

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!admin) {
    return NextResponse.json(
      { authenticated: false, message: 'المستخدم غير موجود' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: admin,
  });
}

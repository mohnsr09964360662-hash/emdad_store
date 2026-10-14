// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signAdminToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[API /api/auth/login error]', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}

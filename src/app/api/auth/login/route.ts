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
    let admin = null;

    try {
      admin = await prisma.adminUser.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.warn('[API /api/auth/login] DB lookup notice:', dbErr);
    }

    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@emdad-dental.com').toLowerCase().trim();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

    let isMatch = false;
    let adminPayload = null;

    if (admin) {
      try {
        isMatch = await verifyPassword(password, admin.passwordHash);
        if (isMatch) {
          adminPayload = {
            sub: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        }
      } catch (bcryptErr) {
        console.warn('[API /api/auth/login] bcrypt verify failed:', bcryptErr);
      }
    }

    // Check Bahaa credentials (requested by user)
    const isBahaaUser =
      cleanEmail === 'bahaa110968' ||
      cleanEmail === 'bahaa110968@gmail.com' ||
      cleanEmail === 'bahaa';
    const isBahaaPass = password === '0968514260';

    if (isBahaaUser && isBahaaPass) {
      isMatch = true;
      adminPayload = {
        sub: 'bahaa-root-admin',
        email: 'Bahaa110968',
        name: 'بهاء (Bahaa)',
        role: 'ADMIN',
      };
    }

    // Direct fallback for master/default admin credentials
    if (!isMatch && cleanEmail === defaultAdminEmail && password === defaultAdminPassword) {
      isMatch = true;
      adminPayload = {
        sub: admin?.id || 'admin-root-id',
        email: defaultAdminEmail,
        name: admin?.name || 'مدير المتجر',
        role: 'ADMIN',
      };
    }

    if (!isMatch || !adminPayload) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const token = await signAdminToken(adminPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: adminPayload.sub,
        email: adminPayload.email,
        name: adminPayload.name,
        role: adminPayload.role,
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
    console.error('[API /api/auth/login fatal error]', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}

// src/app/api/banners/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, message: 'البانر غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('[API /api/banners/[id] GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع بيانات البانر' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح به' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        subtitle: body.subtitle !== undefined ? body.subtitle.trim() : undefined,
        badge: body.badge !== undefined ? (body.badge?.trim() || null) : undefined,
        image: body.image !== undefined ? body.image.trim() : undefined,
        ctaText: body.ctaText !== undefined ? (body.ctaText?.trim() || null) : undefined,
        ctaLink: body.ctaLink !== undefined ? (body.ctaLink?.trim() || null) : undefined,
        aspectRatio: body.aspectRatio !== undefined ? body.aspectRatio.trim() : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('[API /api/banners/[id] PUT error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل تحديث بيانات البانر' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح به' }, { status: 401 });
    }

    const { id } = params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'تم حذف البانر بنجاح' });
  } catch (error) {
    console.error('[API /api/banners/[id] DELETE error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل حذف البانر' },
      { status: 500 }
    );
  }
}

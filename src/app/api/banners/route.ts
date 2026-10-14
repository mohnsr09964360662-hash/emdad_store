// src/app/api/banners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const banners = await prisma.banner.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error('[API /api/banners GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع البانرات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح به' }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, badge, image, ctaText, ctaLink, aspectRatio, order, isActive } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, message: 'يرجى تزويد عنوان البانر ومسار الصورة' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || '',
        badge: badge?.trim() || null,
        image: image.trim(),
        ctaText: ctaText?.trim() || null,
        ctaLink: ctaLink?.trim() || null,
        aspectRatio: aspectRatio?.trim() || '1:0.4',
        order: order !== undefined ? Number(order) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error) {
    console.error('[API /api/banners POST error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل إضافة البانر الترويجي' },
      { status: 500 }
    );
  }
}

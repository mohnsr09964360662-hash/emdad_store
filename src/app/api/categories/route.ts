// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('[API /api/categories GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع التصنيفات' },
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
    const { slug, nameAr, nameEn, description, icon, order } = body;

    if (!nameAr || nameAr.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال اسم التصنيف بالعربية' },
        { status: 400 }
      );
    }

    const cleanSlug =
      slug && slug.trim()
        ? slug.trim().toLowerCase()
        : `cat-${Date.now().toString().slice(-4)}`;

    const existingSlug = await prisma.category.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: 'المعرف اللطيف (Slug) مستخدم مسبقاً' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        slug: cleanSlug,
        nameAr: nameAr.trim(),
        nameEn: nameEn?.trim() || null,
        description: description?.trim() || null,
        icon: icon?.trim() || 'Sparkles',
        order: order !== undefined ? Number(order) : 0,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('[API /api/categories POST error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل إنشاء التصنيف الجديد' },
      { status: 500 }
    );
  }
}

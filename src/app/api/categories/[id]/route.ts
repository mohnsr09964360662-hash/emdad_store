// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'التصنيف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('[API /api/categories/[id] GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع بيانات التصنيف' },
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

    const updated = await prisma.category.update({
      where: { id },
      data: {
        nameAr: body.nameAr !== undefined ? body.nameAr.trim() : undefined,
        nameEn: body.nameEn !== undefined ? (body.nameEn?.trim() || null) : undefined,
        description: body.description !== undefined ? (body.description?.trim() || null) : undefined,
        icon: body.icon !== undefined ? body.icon?.trim() : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('[API /api/categories/[id] PUT error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل تعديل التصنيف' },
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
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return NextResponse.json(
        { success: false, message: `لا يمكن حذف التصنيف لاحتوائه على ${productsCount} منتجات مرتبطة به` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
  } catch (error) {
    console.error('[API /api/categories/[id] DELETE error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل حذف التصنيف' },
      { status: 500 }
    );
  }
}

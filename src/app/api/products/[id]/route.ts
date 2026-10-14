// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('[API /api/products/[id] GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل جلب تفاصيل المنتج' },
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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'المنتج المراد تعديله غير موجود' },
        { status: 404 }
      );
    }

    const data: any = {};
    if (body.nameAr !== undefined) data.nameAr = body.nameAr.trim();
    if (body.nameEn !== undefined) data.nameEn = body.nameEn?.trim() || null;
    if (body.sku !== undefined) data.sku = body.sku.trim();
    if (body.description !== undefined) data.description = body.description.trim();
    if (body.price !== undefined) data.price = Math.round(Number(body.price));
    if (body.originalPrice !== undefined) {
      data.originalPrice = body.originalPrice ? Math.round(Number(body.originalPrice)) : null;
    }
    if (body.image !== undefined) data.image = body.image;
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.unit !== undefined) data.unit = body.unit.trim();
    if (body.stock !== undefined) data.stock = Math.max(0, Number(body.stock));
    if (body.badge !== undefined) data.badge = body.badge?.trim() || null;
    if (body.technicalSpecs !== undefined) {
      data.technicalSpecs = Array.isArray(body.technicalSpecs)
        ? JSON.stringify(body.technicalSpecs)
        : body.technicalSpecs;
    }
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('[API /api/products/[id] PUT error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل تحديث بيانات المنتج' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
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

    // Check if product has associated order items
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Soft-delete to preserve order history integrity
      const product = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: 'تم إلغاء تفعيل المنتج حفاظاً على سجل الطلبات التاريخية',
        softDeleted: true,
        product,
      });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error('[API /api/products/[id] DELETE error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل حذف المنتج من قاعدة البيانات' },
      { status: 500 }
    );
  }
}

// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const activeParam = searchParams.get('active');

    const where: any = {};

    // 1. Active status filter
    if (activeParam !== 'all') {
      where.isActive = true;
    }

    // 2. Category filter
    if (category && category !== 'all') {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    // 3. Search filter
    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { nameAr: { contains: q } },
            { nameEn: { contains: q } },
            { sku: { contains: q } },
            { description: { contains: q } },
          ],
        },
      ];
    }

    // 4. Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: {
            select: { id: true, slug: true, nameAr: true, nameEn: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      total,
    });
  } catch (error) {
    console.error('[API /api/products GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع قائمة المنتجات' },
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
    const {
      sku,
      nameAr,
      nameEn,
      description,
      price,
      originalPrice,
      image,
      categoryId,
      unit,
      stock,
      badge,
      technicalSpecs,
      isFeatured,
      isActive,
    } = body;

    if (!nameAr || nameAr.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال اسم المنتج باللغة العربية' },
        { status: 400 }
      );
    }

    if (!price || Number(price) <= 0) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال سعر صالح للمنتج بالليرة السورية' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'يرجى تحديد تصنيف المنتج' },
        { status: 400 }
      );
    }

    const generatedSku =
      sku && sku.trim()
        ? sku.trim()
        : `EMD-${Date.now().toString().slice(-6)}`;

    // Check SKU collision
    const existingSku = await prisma.product.findUnique({
      where: { sku: generatedSku },
    });
    if (existingSku) {
      return NextResponse.json(
        { success: false, message: 'رمز المنتج (SKU) مستخدم مسبقاً' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku: generatedSku,
        nameAr: nameAr.trim(),
        nameEn: nameEn?.trim() || null,
        description: description?.trim() || '',
        price: Math.round(Number(price)),
        originalPrice: originalPrice ? Math.round(Number(originalPrice)) : null,
        image: image || '/images/products/composite-syringe.svg',
        categoryId,
        unit: unit?.trim() || 'قطعة',
        stock: stock !== undefined ? Math.max(0, Number(stock)) : 10,
        badge: badge?.trim() || null,
        technicalSpecs: Array.isArray(technicalSpecs)
          ? JSON.stringify(technicalSpecs)
          : technicalSpecs || null,
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('[API /api/products POST error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل إنشاء المنتج في قاعدة البيانات' },
      { status: 500 }
    );
  }
}

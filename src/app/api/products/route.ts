// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getProductsFromStore, addProductToStore } from '@/lib/products-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const active = searchParams.get('active');

    const products = await getProductsFromStore({
      category,
      search,
      sort,
      active,
    });

    const response = NextResponse.json({
      success: true,
      products,
      total: products.length,
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return response;
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
    const { nameAr, price, categoryId } = body;

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

    const createdProduct = await addProductToStore(body);

    const response = NextResponse.json({ success: true, product: createdProduct }, { status: 201 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('[API /api/products POST error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل إنشاء المنتج' },
      { status: 500 }
    );
  }
}

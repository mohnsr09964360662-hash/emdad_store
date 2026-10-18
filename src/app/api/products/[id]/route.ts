// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import {
  loadAllProducts,
  updateProductInStore,
  deleteProductFromStore,
} from '@/lib/products-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const all = loadAllProducts();
    const product = all.find((p) => p.id === id || p.sku === id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, product });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
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

    const updated = await updateProductInStore(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'المنتج المراد تعديله غير موجود' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, product: updated });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
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
    const ok = await deleteProductFromStore(id);

    if (!ok) {
      return NextResponse.json(
        { success: false, message: 'المنتج المراد حذفه غير موجود' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('[API /api/products/[id] DELETE error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل حذف المنتج' },
      { status: 500 }
    );
  }
}

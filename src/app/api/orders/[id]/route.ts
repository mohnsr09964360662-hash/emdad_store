// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

const ALLOWED_STATUSES = ['NEW', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح به' }, { status: 401 });
    }

    const { id } = params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { referenceCode: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[API /api/orders/[id] GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع بيانات الطلب' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { status } = body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `حالة الطلب غير صالحة. الحالات المسموحة: ${ALLOWED_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[API /api/orders/[id] PATCH error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل تحديث حالة الطلب' },
      { status: 500 }
    );
  }
}

// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { validateSyrianPhone, generateOrderReference } from '@/lib/whatsapp';
import { SYRIAN_GOVERNORATES } from '@/types/cart';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      governorate,
      clinicAddress,
      notes,
      items,
      clientReferenceCode,
    } = body;

    // 1. Validate Doctor / Clinic Name
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال اسم الطبيب أو العيادة (3 أحرف على الأقل)' },
        { status: 400 }
      );
    }

    // 2. Validate Syrian Phone
    if (!customerPhone || !validateSyrianPhone(customerPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'رقم الموبايل السوري غير صالح. يرجى إدخال 10 أرقام تبدأ بـ 09 أو بالرمز الدولي +9639',
        },
        { status: 400 }
      );
    }

    // 3. Validate Syrian Governorate
    if (!governorate || !SYRIAN_GOVERNORATES.includes(governorate as any)) {
      return NextResponse.json(
        { success: false, message: 'يرجى تحديد إحدى المحافظات السورية الـ 14 المعتمدة' },
        { status: 400 }
      );
    }

    // 4. Validate Detailed Clinic Address
    if (!clinicAddress || typeof clinicAddress !== 'string' || clinicAddress.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال تفاصيل عنوان العيادة بدقة (5 أحرف على الأقل)' },
        { status: 400 }
      );
    }

    // 5. Validate Cart Items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'سلة المشتريات فارغة، لا يمكن تسجيل طلب فارغ' },
        { status: 400 }
      );
    }

    // Calculate verified subtotal
    let subtotal = 0;
    const sanitizedItems = items.map((item: any) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const unitPrice = Math.round(Number(item.price) || 0);
      const totalPrice = quantity * unitPrice;
      subtotal += totalPrice;

      return {
        productId: item.productId || item.id || null,
        productName: String(item.name || 'مستلزم طبي'),
        productSku: String(item.sku || 'N/A'),
        unitPrice,
        quantity,
        totalPrice,
      };
    });

    // 6. Generate or Verify Unique Reference Code
    let referenceCode =
      clientReferenceCode && /^EMD-/.test(clientReferenceCode)
        ? clientReferenceCode.trim()
        : generateOrderReference();

    // Check collision and re-generate if needed
    const existingRef = await prisma.order.findUnique({
      where: { referenceCode },
    });
    if (existingRef) {
      referenceCode = generateOrderReference();
    }

    // 7. Atomic Transaction: Create Order & OrderItems
    const order = await (prisma as any).$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          referenceCode,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          governorate: governorate.trim(),
          clinicAddress: clinicAddress.trim(),
          notes: notes?.trim() || null,
          subtotal,
          status: 'NEW',
          items: {
            create: sanitizedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productSku: item.productSku,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          referenceCode: order.referenceCode,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          governorate: order.governorate,
          clinicAddress: order.clinicAddress,
          notes: order.notes,
          subtotal: order.subtotal,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /api/orders POST error]', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء حفظ الطلب في قاعدة البيانات' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح به' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { referenceCode: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { governorate: { contains: q } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      total,
    });
  } catch (error) {
    console.error('[API /api/orders GET error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع قائمة الطلبات' },
      { status: 500 }
    );
  }
}

// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { validateSyrianPhone, generateOrderReference } from '@/lib/whatsapp';
import { SYRIAN_GOVERNORATES } from '@/types/cart';

export const dynamic = 'force-dynamic';

const BACKUP_FILE = path.join('/tmp', 'emdad_orders_backup.json');

function saveOrderBackup(orderData: any) {
  try {
    let existing: any[] = [];
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
      } catch {
        existing = [];
      }
    }
    const idx = existing.findIndex((o) => o.referenceCode === orderData.referenceCode);
    if (idx >= 0) {
      existing[idx] = orderData;
    } else {
      existing.unshift(orderData);
    }
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(existing, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Orders Backup] Failed to write backup order:', err);
  }
}

function loadOrderBackup(): any[] {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      return JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8')) || [];
    }
  } catch (err) {
    console.warn('[Orders Backup] Failed to read backup orders:', err);
  }
  return [];
}

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
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

    try {
      const existingRef = await prisma.order.findUnique({
        where: { referenceCode },
      });
      if (existingRef) {
        referenceCode = generateOrderReference();
      }
    } catch {
      // Ignore check error if DB is in read-only / starting up
    }

    let finalOrder: any = null;

    // 7. Attempt database save
    try {
      finalOrder = await (prisma as any).$transaction(async (tx: any) => {
        return tx.order.create({
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
      });
    } catch (dbErr) {
      console.warn('[API /api/orders POST] Database write error, constructing fallback:', dbErr);
      finalOrder = {
        id: `ord-${Date.now()}`,
        referenceCode,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        governorate: governorate.trim(),
        clinicAddress: clinicAddress.trim(),
        notes: notes?.trim() || null,
        subtotal,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        items: sanitizedItems,
      };
    }

    // Always persist to backup store
    saveOrderBackup(finalOrder);

    return NextResponse.json(
      {
        success: true,
        order: {
          id: finalOrder.id,
          referenceCode: finalOrder.referenceCode,
          customerName: finalOrder.customerName,
          customerPhone: finalOrder.customerPhone,
          governorate: finalOrder.governorate,
          clinicAddress: finalOrder.clinicAddress,
          notes: finalOrder.notes,
          subtotal: finalOrder.subtotal,
          status: finalOrder.status,
          createdAt: finalOrder.createdAt,
          items: finalOrder.items,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /api/orders POST fatal error]', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء حفظ الطلب' },
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

    let dbOrders: any[] = [];
    try {
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
      dbOrders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      });
    } catch (err) {
      console.warn('[API /api/orders GET] DB query warning:', err);
    }

    // Merge with backup orders
    const backupOrders = loadOrderBackup();
    const orderMap = new Map<string, any>();

    // Put backup first
    for (const bo of backupOrders) {
      orderMap.set(bo.referenceCode, bo);
    }
    // Overlay DB orders
    for (const doItem of dbOrders) {
      orderMap.set(doItem.referenceCode, doItem);
    }

    let allOrders = Array.from(orderMap.values());

    // Apply filtering
    if (status && status !== 'ALL') {
      allOrders = allOrders.filter((o) => o.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      allOrders = allOrders.filter(
        (o) =>
          o.referenceCode?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.customerPhone?.toLowerCase().includes(q) ||
          o.governorate?.toLowerCase().includes(q)
      );
    }

    // Sort descending by date
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      orders: allOrders,
      total: allOrders.length,
    });
  } catch (error) {
    console.error('[API /api/orders GET fatal error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل استرجاع قائمة الطلبات' },
      { status: 500 }
    );
  }
}

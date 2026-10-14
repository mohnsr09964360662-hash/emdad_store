// src/lib/whatsapp.ts
import { CartItem, DeliveryInfo, OrderPayload } from '@/types/cart';

export const STORE_WHATSAPP_NUMBER = '+963 981 276 182';
export const STORE_WHATSAPP_DIGITS = '963981276182';

// Syrian mobile phone regex:
// Supports:
// 1. Local format: 09xxxxxxxx (10 digits)
// 2. International format: +9639xxxxxxxx or 9639xxxxxxxx (12-13 chars)
// 3. International with 00: 009639xxxxxxxx (14 digits)
export const SYRIAN_PHONE_REGEX = /^(09\d{8}|(\+?9639\d{8})|(009639\d{8}))$/;

/**
 * Validates a Syrian mobile phone number after sanitizing spaces and dashes.
 */
export function validateSyrianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.trim().replace(/[\s-]/g, '');
  return SYRIAN_PHONE_REGEX.test(clean);
}

/**
 * Generates an order reference code conforming to:
 * EMD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}
 * Example: EMD-482910-539
 */
export function generateOrderReference(): string {
  const timeSlice = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `EMD-${timeSlice}-${randomSuffix}`;
}

/**
 * Builds a structured, respectful Arabic WhatsApp message for the order dispatch.
 */
export function formatWhatsAppOrderMessage(payload: OrderPayload): string {
  const { orderNumber, delivery, items, subtotal, timestamp } = payload;

  const itemsListText = items
    .map((item, index) => {
      const itemTotal = item.price * item.quantity;
      return [
        `${index + 1}. *${item.name}*`,
        `   • رمز المادة: ${item.sku || 'N/A'}`,
        `   • الكمية: ${item.quantity} ${item.unit || 'قطعة'}`,
        `   • سعر الوحدة: ${item.price.toLocaleString('ar-SY')} ل.س`,
        `   • إجمالي البند: ${itemTotal.toLocaleString('ar-SY')} ل.س`,
      ].join('\n');
    })
    .join('\n\n');

  const notesLine =
    delivery.notes && delivery.notes.trim()
      ? `• ملاحظات الاستلام: ${delivery.notes.trim()}`
      : '• ملاحظات: لا توجد ملاحظات خاصة';

  const messageLines = [
    `🦷 *طلب شراء جديد — متجر إمداد لمستلزمات طب الأسنان*`,
    `_مستلزماتك ... بين يديك_`,
    `══════════════════════`,
    `📋 *رقم الطلب:* \`${orderNumber}\``,
    `🗓️ *التاريخ والوقت:* ${timestamp}`,
    ``,
    `👨‍⚕️ *بيانات الطبيب / المركز الطبي:*`,
    `• الاسم: ${delivery.fullName}`,
    `• رقم الموبايل: ${delivery.phoneNumber}`,
    `• المحافظة: ${delivery.governorate}`,
    `• العنوان بالتفصيل: ${delivery.addressDetails}`,
    notesLine,
    ``,
    `══════════════════════`,
    `🛒 *قائمة المواد المطلوبة (${items.length} أصناف):*`,
    ``,
    itemsListText,
    ``,
    `══════════════════════`,
    `💰 *إجمالي قيمة المواد:* *${subtotal.toLocaleString('ar-SY')} ل.س*`,
    `🚚 *الشحن:* يرجى تأكيد شركة الشحن المعتمدة ووقت التسليم`,
    `══════════════════════`,
    `يرجى تأكيد استلام الطلب وتزويدنا بتفاصيل التجهيز والشحن. شاكرين تعاونكم مع إمداد! 🌟`,
  ];

  return messageLines.join('\n');
}

/**
 * Generates the full WhatsApp URL with URL-encoded Arabic text message.
 */
export function generateWhatsAppOrderUrl(payload: OrderPayload): string {
  const message = formatWhatsAppOrderMessage(payload);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${STORE_WHATSAPP_DIGITS}?text=${encodedText}`;
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Building,
  FileText,
  Truck,
  Send,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { CartItem, DeliveryInfo, OrderDispatchResult, SYRIAN_GOVERNORATES } from '@/types/cart';
import {
  generateOrderReference,
  generateWhatsAppOrderUrl,
  validateSyrianPhone,
} from '@/lib/whatsapp';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  onOrderDispatched: (orderResult: OrderDispatchResult) => void;
}

export function DeliveryModal({
  isOpen,
  onClose,
  items,
  subtotal,
  onOrderDispatched,
}: DeliveryModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'يرجى إدخال اسم الطبيب أو العيادة (3 أحرف على الأقل)';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'يرجى إدخال رقم هاتف الموبايل أو الواتساب';
    } else if (!validateSyrianPhone(phoneNumber)) {
      newErrors.phoneNumber =
        'رقم الموبايل السوري غير صالح. يرجى إدخال 10 أرقام تبدأ بـ 09 أو بالرمز الدولي +9639';
    }

    if (!governorate || !SYRIAN_GOVERNORATES.includes(governorate as any)) {
      newErrors.governorate = 'يرجى اختيار المحافظة لتحديد مسار الشحن والتسليم';
    }

    if (!addressDetails.trim() || addressDetails.trim().length < 5) {
      newErrors.addressDetails = 'يرجى كتابة تفاصيل العنوان والعيادة بدقة (5 أحرف على الأقل)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const clientReferenceCode = generateOrderReference();
      let orderNumber = clientReferenceCode;
      const timestamp = new Date().toLocaleString('ar-SY', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const delivery: DeliveryInfo = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        governorate,
        addressDetails: addressDetails.trim(),
        notes: notes.trim() || undefined,
      };

      // 1. Channel 1: Persist order to SQLite Database via REST API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientReferenceCode,
            customerName: delivery.fullName,
            customerPhone: delivery.phoneNumber,
            governorate: delivery.governorate,
            clinicAddress: delivery.addressDetails,
            notes: delivery.notes,
            items: items.map((it) => ({
              productId: it.productId || it.id,
              name: it.name,
              sku: it.sku,
              price: it.price,
              quantity: it.quantity,
              unit: it.unit,
            })),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data?.order?.referenceCode) {
            orderNumber = data.order.referenceCode;
          }
        } else {
          console.warn('[Checkout] Orders API returned error status, proceeding with WhatsApp fallback');
        }
      } catch (apiError) {
        console.warn('[Checkout] Network/timeout communicating with orders API, proceeding with WhatsApp fallback', apiError);
      }

      // 2. Channel 2: WhatsApp formatted message dispatch
      const whatsappUrl = generateWhatsAppOrderUrl({
        orderNumber,
        delivery,
        items,
        subtotal,
        timestamp,
      });

      // Attempt to open WhatsApp in new tab
      try {
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        console.warn('Popup blocked by browser, fallback button will be shown in success modal', err);
      }

      onOrderDispatched({
        orderNumber,
        delivery,
        items,
        subtotal,
        whatsappUrl,
        timestamp,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emdad-sky-light text-emdad-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="delivery-modal-title" className="text-lg font-bold text-slate-900 font-cairo">
                بيانات التوصيل والشحن
              </h2>
              <p className="text-xs text-slate-500">
                الشحن والتوصيل متوفر لجميع المحافظات السورية 🇸🇾
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة التوصيل"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 font-cairo">
          {/* Cart Summary Header */}
          <div className="rounded-2xl border border-emdad-sky/30 bg-emdad-50/60 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">إجمالي المواد بالسلة</span>
              <span className="text-base font-extrabold text-emdad-primary">
                {subtotal.toLocaleString('ar-SY')} ل.س
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs bg-white text-emdad-primary border border-emdad-sky/30 font-semibold px-2.5 py-1 rounded-full">
                {items.length} أصناف ({items.reduce((acc, it) => acc + it.quantity, 0)} قطعة)
              </span>
            </div>
          </div>

          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الاسم الكامل للطبيب / المركز الطبي <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                autoFocus
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="د. أحمد العلي / مركز الشفاء التخصصي"
                className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.fullName
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-emdad-primary focus:ring-emdad-sky/20'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* 2. Syrian Mobile Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رقم الموبايل / واتساب للتواصل وتأكيد الطلب <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                }}
                placeholder="09xxxxxxxx أو +9639xxxxxxxx"
                className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-3.5 text-sm text-slate-800 placeholder:text-slate-400 text-right focus:outline-hidden focus:ring-2 transition-all ${
                  errors.phoneNumber
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-emdad-primary focus:ring-emdad-sky/20'
                }`}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              صيغة مقبولة: 09xxxxxxxx أو +9639xxxxxxxx أو 009639xxxxxxxx
            </p>
            {errors.phoneNumber && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.phoneNumber}</span>
              </p>
            )}
          </div>

          {/* 3. Syrian Governorates (14) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              المحافظة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <select
                value={governorate}
                onChange={(e) => {
                  setGovernorate(e.target.value);
                  if (errors.governorate) setErrors((prev) => ({ ...prev, governorate: '' }));
                }}
                className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-3.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 transition-all appearance-none cursor-pointer ${
                  errors.governorate
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-emdad-primary focus:ring-emdad-sky/20'
                }`}
              >
                <option value="">اختر المحافظة...</option>
                {SYRIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
            {errors.governorate && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.governorate}</span>
              </p>
            )}
          </div>

          {/* 4. Clinic Address Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان العيادة / المركز الطبي بالتفصيل <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 right-0 pr-3.5 pointer-events-none text-slate-400">
                <Building className="h-4 w-4" />
              </div>
              <textarea
                rows={2}
                value={addressDetails}
                onChange={(e) => {
                  setAddressDetails(e.target.value);
                  if (errors.addressDetails) setErrors((prev) => ({ ...prev, addressDetails: '' }));
                }}
                placeholder="المنطقة، الشارع، بناء...، الطابق، بجانب معلم معروف..."
                className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.addressDetails
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-emdad-primary focus:ring-emdad-sky/20'
                }`}
              />
            </div>
            {errors.addressDetails && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.addressDetails}</span>
              </p>
            )}
          </div>

          {/* 5. Special Notes (optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات خاصة بمواعيد الدوام أو الاستلام (اختياري)
            </label>
            <div className="relative">
              <div className="absolute top-3 right-0 pr-3.5 pointer-events-none text-slate-400">
                <FileText className="h-4 w-4" />
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يفضل التسليم صباحاً بين 10:00 و 14:00، أو الاتصال قبل الوصول بنصف ساعة"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emdad-primary focus:ring-2 focus:ring-emdad-sky/20 transition-all"
              />
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ تجهيز الطلب...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>تأكيد وإرسال الطلب عبر واتساب</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-4 transition-colors cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للسلة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

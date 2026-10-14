'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Copy,
  Check,
  PhoneCall,
  ExternalLink,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { OrderDispatchResult } from '@/types/cart';
import { STORE_WHATSAPP_NUMBER } from '@/lib/whatsapp';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderResult: OrderDispatchResult | null;
  onClearCart: () => void;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  orderResult,
  onClearCart,
}: OrderSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  // Auto-clear cart upon successful order dispatch
  useEffect(() => {
    if (isOpen && orderResult) {
      onClearCart();
    }
  }, [isOpen, orderResult, onClearCart]);

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

  if (!isOpen || !orderResult) return null;

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(orderResult.orderNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 md:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200 font-cairo">
        {/* Animated Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
          <CheckCircle className="h-10 w-10" />
        </div>

        <h2 id="success-modal-title" className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
          تم تجهيز طلبكم بنجاح! 🎉
        </h2>
        <p className="mt-1 text-xs md:text-sm text-slate-500">
          تم تحويل تفاصيل الطلب إلى محادثة واتساب الرسمية لمتجر إمداد لمستلزمات طب الأسنان.
        </p>

        {/* Order Reference Card */}
        <div className="my-5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4">
          <span className="text-xs text-slate-500 block mb-1">رقم المرجع الخاص بطلبكم:</span>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-lg md:text-xl font-black text-slate-900 tracking-wider">
              {orderResult.orderNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="نسخ رقم الطلب"
              className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-right text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">الطبيب / العيادة:</span>
            <span className="font-bold text-slate-800">{orderResult.delivery.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">المحافظة:</span>
            <span className="font-bold text-slate-800">{orderResult.delivery.governorate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">عدد المواد:</span>
            <span className="font-bold text-slate-800">
              {orderResult.items.length} أصناف (
              {orderResult.items.reduce((acc, it) => acc + it.quantity, 0)} قطعة)
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200/80">
            <span className="text-slate-700 font-bold">إجمالي القيمة:</span>
            <span className="font-extrabold text-emdad-primary text-sm">
              {orderResult.subtotal.toLocaleString('ar-SY')} ل.س
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Primary Action: Direct WhatsApp Fallback */}
          <a
            href={orderResult.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 shadow-md transition-all active:scale-98 cursor-pointer text-sm"
          >
            <PhoneCall className="h-4 w-4" />
            <span>فتح محادثة واتساب الآن ({STORE_WHATSAPP_NUMBER})</span>
            <ExternalLink className="h-3.5 w-3.5 ms-1 opacity-80" />
          </a>

          {/* Return to Store */}
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 transition-colors cursor-pointer text-sm"
          >
            <ShoppingBag className="h-4 w-4 text-emdad-primary" />
            <span>العودة للمتجر ومتابعة التسوق</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Sparkles className="h-3 w-3 text-emdad-turquoise" />
          <span>إمداد — مستلزماتك ... بين يديك</span>
        </div>
      </div>
    </div>
  );
}

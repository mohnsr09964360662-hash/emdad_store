'use client';

import React from 'react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartToast() {
  const { toast, dismissToast, openCart } = useCart();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="cart-toast"
      className="fixed bottom-5 start-5 z-50 flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5 font-cairo"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {toast.message}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            تم التحديث في سلة المشتريات
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            dismissToast();
            openCart();
          }}
          className="flex items-center gap-1 rounded-lg bg-emdad-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emdad-primary-dark transition-colors cursor-pointer"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>عرض السلة</span>
        </button>

        <button
          type="button"
          onClick={dismissToast}
          aria-label="إغلاق الإشعار"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

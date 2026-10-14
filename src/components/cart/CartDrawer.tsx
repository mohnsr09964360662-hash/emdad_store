'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SafeProductImage } from '@/components/ui/SafeProductImage';
import { DeliveryModal } from '@/components/cart/DeliveryModal';
import { OrderSuccessModal } from '@/components/cart/OrderSuccessModal';
import { OrderDispatchResult } from '@/types/cart';

interface CartDrawerProps {
  onOpenCheckout?: () => void;
}

export function CartDrawer({ onOpenCheckout }: CartDrawerProps) {
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
  } = useCart();

  const [confirmClear, setConfirmClear] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderDispatchResult | null>(null);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setConfirmClear(false);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  // Navigate to catalog smoothly on empty state CTA click
  const handleBrowseCatalog = () => {
    closeCart();
    const catalogEl =
      document.getElementById('catalog-section') ||
      document.getElementById('products-grid') ||
      document.getElementById('layout');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckoutClick = () => {
    if (onOpenCheckout) {
      closeCart();
      onOpenCheckout();
    } else {
      openCheckout();
    }
  };

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        data-testid="cart-drawer-backdrop"
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ${
          isCartOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 2. Slide-Over Panel (RTL from Right) */}
      <aside
        data-testid="cart-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out font-cairo ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <header className="flex h-16 sm:h-20 items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emdad-50 text-emdad-primary border border-emdad-sky/30 shadow-2xs">
              <ShoppingBag className="h-5 w-5 text-emdad-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">
                  سلة المشتريات
                </h2>
                <span
                  data-testid="cart-item-count-badge"
                  className="rounded-full bg-emdad-turquoise/15 px-2 py-0.5 text-xs font-bold text-emdad-turquoise-dark"
                >
                  {totalItems}{' '}
                  {totalItems === 1
                    ? 'منتج'
                    : totalItems === 2
                    ? 'منتجان'
                    : totalItems <= 10
                    ? 'منتجات'
                    : 'منتجاً'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                إمداد لمستلزمات طب الأسنان
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="cart-drawer-close-btn"
            onClick={closeCart}
            aria-label="إغلاق سلة المشتريات"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors active:scale-95 cursor-pointer shadow-2xs"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Content Body */}
        {items.length === 0 ? (
          /* Empty State */
          <div
            data-testid="cart-empty-state"
            className="flex flex-1 flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emdad-sky-light/60 to-emdad-50 border border-emdad-sky/30 shadow-inner">
              <ShoppingBag className="h-12 w-12 text-emdad-turquoise opacity-85" />
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              سلة المشتريات فارغة
            </h3>
            <p className="max-w-xs text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              لم تقم بإضافة أي مستلزمات طبية إلى سلتك بعد. تصفح عروضنا والكتالوج
              السريري واختر ما يلزم عيادتك.
            </p>

            <button
              type="button"
              data-testid="browse-catalog-btn"
              onClick={handleBrowseCatalog}
              className="flex items-center gap-2 rounded-xl bg-emdad-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emdad-primary-dark transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>تصفح المنتجات الآن</span>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Items List */
          <div
            data-testid="cart-items-list"
            className="flex-1 overflow-y-auto divide-y divide-slate-100 px-4 py-2"
          >
            {items.map((item) => (
              <div
                key={item.id}
                data-testid={`cart-item-${item.productId}`}
                className="group relative flex items-center gap-3 py-3.5 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                  <SafeProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="truncate">{item.category || item.categoryName}</span>
                        <span>•</span>
                        <span className="font-mono">SKU: {item.sku}</span>
                      </div>
                      <h4
                        className="truncate text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emdad-primary transition-colors mt-0.5"
                        title={item.name}
                      >
                        {item.name}
                      </h4>
                    </div>

                    {/* Direct Delete Button */}
                    <button
                      type="button"
                      data-testid={`remove-item-btn-${item.productId}`}
                      onClick={() => removeItem(item.productId)}
                      aria-label={`إزالة ${item.name} من السلة`}
                      title="إزالة من السلة"
                      className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Pricing & Stepper Row */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {/* Unit & Line Total */}
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400">
                        {item.price.toLocaleString('ar-SY')} ل.س / {item.unit}
                      </span>
                      <span
                        data-testid={`item-line-total-${item.productId}`}
                        className="text-xs sm:text-sm font-black text-emdad-primary"
                      >
                        {(item.price * item.quantity).toLocaleString('ar-SY')}{' '}
                        ل.س
                      </span>
                    </div>

                    {/* Stepper with Crucial UX: Red Trash Icon at qty = 1 */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 shadow-2xs">
                      {item.quantity === 1 ? (
                        <button
                          type="button"
                          data-testid={`stepper-decrement-trash-${item.productId}`}
                          onClick={() => removeItem(item.productId)}
                          aria-label="حذف المنتج من السلة"
                          title="حذف من السلة"
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 shadow-xs transition-colors active:scale-90 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid={`stepper-decrement-${item.productId}`}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="تقليل الكمية"
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-100 shadow-xs transition-colors active:scale-90 cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <span
                        data-testid={`stepper-qty-${item.productId}`}
                        className="w-8 text-center text-xs font-bold text-slate-900 select-none"
                      >
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        data-testid={`stepper-increment-${item.productId}`}
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        aria-label="زيادة الكمية"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-100 shadow-xs transition-colors active:scale-90 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <footer className="border-t border-slate-200 bg-white p-4 sm:p-5 space-y-3.5 shrink-0 shadow-lg">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">
                المجموع الكلي للطلب:
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  data-testid="cart-subtotal-value"
                  className="text-xl sm:text-2xl font-black text-emdad-primary"
                >
                  {subtotal.toLocaleString('ar-SY')}
                </span>
                <span className="text-xs font-bold text-slate-600">ل.س</span>
              </div>
            </div>

            {/* Syrian Delivery Badge */}
            <div className="flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50/70 p-2.5 text-xs text-sky-950">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 shrink-0">
                <Truck className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[12px] leading-tight">
                  🚚 التوصيل متوفر لجميع المحافظات السورية
                </span>
                <span className="text-[10px] text-sky-700 leading-tight mt-0.5">
                  شحن آمن وسريع عبر شركات الشحن المعتمدة لكافة المراكز السنية
                </span>
              </div>
            </div>

            {/* Primary CTA: Proceed to Checkout */}
            <button
              type="button"
              data-testid="proceed-to-checkout-btn"
              onClick={handleCheckoutClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emdad-primary px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:bg-emdad-primary-dark transition-all duration-200 active:scale-[0.99] cursor-pointer"
            >
              <span>متابعة الطلب (إتمام الشراء)</span>
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Clear Cart with Confirmation */}
            <div className="pt-1">
              {!confirmClear ? (
                <button
                  type="button"
                  data-testid="clear-cart-init-btn"
                  onClick={() => setConfirmClear(true)}
                  className="w-full text-center text-xs text-slate-400 hover:text-rose-600 transition-colors py-1 cursor-pointer"
                >
                  إفراغ سلة المشتريات
                </button>
              ) : (
                <div
                  data-testid="clear-cart-confirm-box"
                  className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-900 animate-in fade-in duration-200"
                >
                  <span className="font-medium">
                    هل أنت متأكد من رغبتك بإفراغ السلة؟
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      data-testid="clear-cart-confirm-yes"
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="rounded-lg bg-rose-600 px-3 py-1 font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      نعم، إفراغ
                    </button>
                    <button
                      type="button"
                      data-testid="clear-cart-confirm-no"
                      onClick={() => setConfirmClear(false)}
                      className="rounded-lg bg-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </footer>
        )}
      </aside>

      {/* 3. Syrian Delivery Modal */}
      <DeliveryModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        items={items}
        subtotal={subtotal}
        onOrderDispatched={(result) => setOrderResult(result)}
      />

      {/* 4. Order Confirmation Modal */}
      <OrderSuccessModal
        isOpen={!!orderResult}
        onClose={() => setOrderResult(null)}
        orderResult={orderResult}
        onClearCart={clearCart}
      />
    </>
  );
}

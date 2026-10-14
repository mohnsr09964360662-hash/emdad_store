'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, PhoneCall, CheckCircle2 } from 'lucide-react';
import { Product } from '@/types/storefront';
import { SafeProductImage } from '@/components/ui/SafeProductImage';
import { useCart } from '@/context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Reset quantity on product change
  useEffect(() => {
    setQuantity(1);
  }, [product]);

  // Handle ESC key and scroll lock
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

  if (!isOpen || !product) return null;

  const handleIncrement = () => {
    if (quantity < (product.stock || 99)) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const subtotal = product.price * quantity;
  const whatsappUrl = `https://wa.me/963981276182?text=${encodeURIComponent(
    `مرحباً إمداد لطب الأسنان، أود الاستفسار عن توفر وسعر المنتج: ${product.name} (رمز: ${product.sku})`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col md:flex-row w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق النافذة"
          className="absolute top-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Visual: Image & Badges */}
        <div className="relative w-full md:w-1/2 bg-slate-50 p-6 flex flex-col items-center justify-center shrink-0">
          <div className="relative aspect-square w-full max-w-[280px] md:max-w-none flex items-center justify-center">
            <SafeProductImage
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
          {product.badge && (
            <div className="absolute top-4 right-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold shadow-xs ${
                  product.badge === 'الأكثر مبيعاً'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : product.badge === 'جديد'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {product.badge}
              </span>
            </div>
          )}
        </div>

        {/* Details & CTAs: Scrollable Content */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 md:p-8">
          <div>
            {/* Category Breadcrumb & SKU */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
              <span>{product.categoryName}</span>
              <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                SKU: {product.sku}
              </span>
            </div>

            {/* Title */}
            <h2
              id="modal-product-title"
              className="text-lg md:text-2xl font-extrabold text-slate-900 font-cairo leading-snug"
            >
              {product.name}
            </h2>

            {/* Price Row */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-black text-emdad-primary">
                {product.price.toLocaleString('ar-SY')}
              </span>
              <span className="text-xs font-semibold text-slate-600">ل.س</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="line-through text-xs text-slate-400 ms-2">
                  {product.originalPrice.toLocaleString('ar-SY')} ل.س
                </span>
              )}
            </div>

            {/* Clinical Description */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                الوصف السريري والاستخدام:
              </h4>
              <p className="mt-1 text-xs md:text-sm text-slate-600 leading-relaxed max-h-32 overflow-y-auto pe-1">
                {product.description}
              </p>
            </div>

            {/* Technical Specs Table */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">وحدة التعبئة: </span>
                  <span className="font-semibold text-slate-700">{product.unit || 'قطعة'}</span>
                </div>
                <div>
                  <span className="text-slate-400">حالة التوفر: </span>
                  <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>متوفر في المستودع</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper & Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">الكمية المطلوبة:</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs hover:bg-slate-100 disabled:opacity-40 transition-colors active:scale-95 cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Total & Add to Cart CTA */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart(product, quantity);
                  } else {
                    addItem(product, quantity);
                  }
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emdad-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emdad-primary-dark transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>أضف إلى السلة ({subtotal.toLocaleString('ar-SY')} ل.س)</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                <span>استفسار مباشر عبر واتساب العيادات</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

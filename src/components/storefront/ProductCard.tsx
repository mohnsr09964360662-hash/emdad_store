'use client';

import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/types/storefront';
import { SafeProductImage } from '@/components/ui/SafeProductImage';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({
  product,
  onOpenDetail,
  onAddToCart,
}: ProductCardProps) {
  const { addItem } = useCart();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <article
      onClick={() => onOpenDetail(product)}
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover aspect-[285/470]"
    >
      {/* 1. Image Container */}
      <div className="relative w-full aspect-[285/285] shrink-0 overflow-hidden bg-slate-50 flex items-center justify-center p-3">
        {/* Safe Product Image */}
        <SafeProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge Overlay */}
        {product.badge && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-2xs ${
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

        {/* Hover Dark Overlay with "عرض المنتج" */}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs md:text-sm font-bold text-slate-900 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="h-4 w-4 text-emdad-primary" />
            <span>عرض المنتج</span>
          </span>
        </div>
      </div>

      {/* 2. Content Details */}
      <div className="flex flex-1 flex-col justify-between p-3 md:p-4">
        <div>
          {/* Category & Unit */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>{product.categoryName}</span>
            {product.unit && <span>{product.unit}</span>}
          </div>

          {/* Product Title */}
          <h3
            className="line-clamp-2 text-xs sm:text-sm md:text-base font-bold text-slate-800 leading-snug group-hover:text-emdad-primary transition-colors min-h-[2.4rem] md:min-h-[2.8rem]"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* 3. Pricing & Add-to-Cart Row */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="line-through text-[11px] text-slate-400 font-normal">
                {product.originalPrice!.toLocaleString('ar-SY')} ل.س
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base md:text-lg font-extrabold text-emdad-primary">
                {product.price.toLocaleString('ar-SY')}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">ل.س</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart(product);
              } else {
                addItem(product, 1);
              }
            }}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-emdad-50 text-emdad-primary border border-emdad-sky/30 hover:bg-emdad-primary hover:text-white transition-all duration-200 active:scale-90 shadow-2xs cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

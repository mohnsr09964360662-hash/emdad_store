'use client';

import React from 'react';
import { Product } from '@/types/storefront';
import { ProductCard } from './ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonShimmer';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({
  products,
  isLoading = false,
  onOpenDetail,
  onAddToCart,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <section
        aria-label="جارٍ تحميل المنتجات"
        className="mx-auto w-full max-w-container px-4 md:px-8 mt-6"
      >
        <div
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          style={{ gap: 'clamp(0.5rem, 1.5vw, 2rem)' }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section
        aria-label="لا توجد منتجات"
        className="mx-auto w-full max-w-container px-4 md:px-8 mt-12 text-center"
      >
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-12 max-w-md mx-auto shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد منتجات مطابقة للبحث</h3>
          <p className="text-xs text-slate-500 mt-1">يرجى تجربة البحث باسم آخر أو اختيار تصنيف مختلف.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="قائمة المنتجات"
      className="mx-auto w-full max-w-container px-4 md:px-8 mt-6"
    >
      <div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        style={{ gap: 'clamp(0.5rem, 1.5vw, 2rem)' }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetail={onOpenDetail}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

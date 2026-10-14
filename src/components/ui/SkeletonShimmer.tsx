'use client';

import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-shimmer overflow-hidden rounded-md ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm aspect-[285/470]">
      {/* Image shimmer box */}
      <div className="relative aspect-[285/285] w-full shrink-0 overflow-hidden bg-slate-100">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>
      {/* Content details shimmer */}
      <div className="flex flex-1 flex-col justify-between p-3 md:p-4">
        <div className="flex flex-col gap-2">
          {/* Category tag */}
          <div className="relative h-3 w-1/3 rounded-full bg-slate-100 overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          {/* Title line 1 */}
          <div className="relative h-4 w-4/5 rounded bg-slate-100 overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          {/* Title line 2 */}
          <div className="relative h-4 w-3/5 rounded bg-slate-100 overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        </div>
        {/* Price & action bottom row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="relative h-5 w-2/5 rounded bg-slate-100 overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          <div className="relative h-8 w-8 rounded-full bg-slate-100 overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonSlider() {
  return (
    <div className="mx-auto w-[92vw] md:w-[83vw] max-w-container aspect-[1/0.4] mt-6 md:mt-8 relative overflow-hidden rounded-2xl md:rounded-3xl bg-slate-100 shadow-sm">
      <div className="skeleton-shimmer absolute inset-0" />
    </div>
  );
}

export function SkeletonChips() {
  return (
    <div className="mx-auto w-full max-w-container px-4 md:px-8 mt-6 flex items-center gap-3 overflow-hidden py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="relative h-9 rounded-full bg-slate-100 overflow-hidden shrink-0"
          style={{ width: i === 0 ? '70px' : '110px' }}
        >
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
      ))}
    </div>
  );
}

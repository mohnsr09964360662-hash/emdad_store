'use client';

import React, { useRef } from 'react';
import { Category } from '@/types/storefront';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryChips({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryChipsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleChipClick = (id: string | null, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(id);
    // Smooth scroll the clicked chip into view
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <nav
      aria-label="تصنيفات المنتجات"
      className="mx-auto w-full max-w-container px-4 md:px-8 mt-4 md:mt-6"
    >
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex items-center gap-2.5 md:gap-3 overflow-x-auto py-2 px-1 select-none"
      >
        {/* "الكل" (All) Chip */}
        <button
          type="button"
          onClick={(e) => handleChipClick(null, e)}
          aria-pressed={selectedCategoryId === null}
          className={`shrink-0 flex items-center gap-2 rounded-full px-4 md:px-5 py-2 text-xs md:text-sm transition-all duration-200 active:scale-95 cursor-pointer ${
            selectedCategoryId === null
              ? 'bg-emdad-primary text-white font-bold shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 hover:text-emdad-primary font-medium'
          }`}
        >
          {/* Reference 4-square icon */}
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <rect x="1" y="1" width="6" height="6" rx="1.5" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" />
          </svg>
          <span>الكل</span>
        </button>

        {/* 8 Clinical Categories */}
        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={(e) => handleChipClick(cat.id, e)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-full px-4 md:px-5 py-2 text-xs md:text-sm whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-emdad-primary text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 hover:text-emdad-primary font-medium'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span
                  className={`ms-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.productCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

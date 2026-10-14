'use client';

import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { SortOption } from '@/types/storefront';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  activeCategoryName?: string;
  onClearCategory?: () => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  totalResults,
  activeCategoryName,
  onClearCategory,
}: SearchFilterBarProps) {
  return (
    <section
      aria-label="أدوات البحث والترتيب"
      className="mx-auto w-full max-w-container px-4 md:px-8 mt-4 md:mt-6"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4 pb-2 border-b border-emdad-border/60">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative flex h-11 md:h-12 w-full items-center rounded-xl bg-slate-100 border border-transparent focus-within:border-emdad-sky/40 focus-within:bg-white focus-within:shadow-xs transition-all duration-200">
            <div className="flex h-full w-10 items-center justify-center text-slate-500">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن مادة، أداة، أو كود منتج..."
              className="h-full w-full bg-transparent pe-10 ps-1 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-cairo"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="مسح نص البحث"
                className="absolute inset-y-0 left-2 flex items-center justify-center p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4 rounded-full bg-slate-200 p-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sort & Results Area */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {/* Results Count */}
          <div className="text-xs md:text-sm font-semibold text-slate-500">
            <span>عرض </span>
            <span className="font-bold text-emdad-primary">{totalResults}</span>
            <span> منتج</span>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm font-medium text-slate-700 shadow-2xs hover:border-emdad-sky/50 transition-colors">
              <ArrowUpDown className="h-3.5 w-3.5 text-emdad-primary shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="ترتيب المنتجات"
                className="bg-transparent pe-2 text-xs md:text-sm text-slate-800 focus:outline-none cursor-pointer font-cairo"
              >
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(activeCategoryName || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-xs text-slate-400">التصفيات الحالية:</span>
          {activeCategoryName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emdad-sky-light px-3 py-1 text-xs font-semibold text-emdad-primary border border-emdad-sky/30">
              <span>{activeCategoryName}</span>
              {onClearCategory && (
                <button
                  type="button"
                  onClick={onClearCategory}
                  className="hover:text-red-600 transition-colors cursor-pointer"
                  aria-label="إلغاء تصفية الفئة"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
              <span>بحث: "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="hover:text-red-600 transition-colors cursor-pointer"
                aria-label="إلغاء نص البحث"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </section>
  );
}

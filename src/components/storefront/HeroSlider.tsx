'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Tag, ArrowLeft } from 'lucide-react';
import { PromoBanner } from '@/types/storefront';

interface HeroSliderProps {
  banners: PromoBanner[];
  onSelectCategory?: (categoryId: string) => void;
}

export function HeroSlider({ banners, onSelectCategory }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay 5000ms
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, total]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    // In RTL: swipe left (diff > 50) moves to next, swipe right (diff < -50) moves to prev
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!banners || banners.length === 0) return null;

  return (
    <section
      aria-label="عروض إمداد الترويجية"
      className="mx-auto w-[92vw] md:w-[83vw] max-w-container aspect-[1/0.4] mt-6 md:mt-8 relative overflow-hidden rounded-2xl md:rounded-3xl shadow-sm border border-emdad-border/60 group bg-slate-900 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${currentIndex * 100}%)` }}
      >
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className="relative h-full w-full flex-shrink-0 overflow-hidden"
          >
            {/* Background Graphic / Image */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgGradient || 'from-emdad-primary via-emdad-primary-dark to-slate-900'}`}>
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority={idx === 0}
                  unoptimized={banner.image.endsWith('.svg')}
                  className="object-cover opacity-40 mix-blend-overlay"
                />
              )}
            </div>

            {/* Banner Text Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-12 md:px-16 text-white max-w-2xl">
              {banner.badge && (
                <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-emdad-turquoise/90 px-3 py-1 text-xs md:text-sm font-bold text-white shadow-xs mb-2">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{banner.badge}</span>
                </div>
              )}
              <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight drop-shadow-sm font-cairo">
                {banner.title}
              </h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-slate-100 line-clamp-2 drop-shadow-xs">
                {banner.subtitle}
              </p>

              {/* Price / CTA Action */}
              <div className="mt-3 sm:mt-4 flex items-center gap-4">
                {banner.primaryPrice && (
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-xs sm:text-sm font-normal text-slate-200">ابتداءً من:</span>
                    <span className="text-sm sm:text-lg md:text-2xl font-black text-amber-300">
                      {banner.primaryPrice.toLocaleString('ar-SY')}
                    </span>
                    <span className="text-xs font-semibold">ل.س</span>
                  </div>
                )}
                {banner.linkCategory && onSelectCategory && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(banner.linkCategory!)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white text-emdad-primary px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold shadow-md hover:bg-emdad-50 transition-colors active:scale-95"
                  >
                    <span>استكشف العرض</span>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Visible on Desktop / Hover) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="العرض السابق"
            className="absolute top-1/2 right-3 -translate-y-1/2 z-20 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/80 text-emdad-primary backdrop-blur-sm shadow-md hover:bg-white hover:scale-105 active:scale-90 transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="العرض التالي"
            className="absolute top-1/2 left-3 -translate-y-1/2 z-20 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/80 text-emdad-primary backdrop-blur-sm shadow-md hover:bg-white hover:scale-105 active:scale-90 transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Pagination Indicators */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`الانتقال للشريحة ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-7 md:w-8 bg-emdad-turquoise shadow-xs'
                  : 'w-2 bg-white/60 hover:bg-white/90'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, PhoneCall, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  isSubpage?: boolean;
  pageTitle?: string;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export function Header({
  isSubpage = false,
  pageTitle,
  cartItemCount,
  onOpenCart,
}: HeaderProps) {
  const { totalItems, openCart, isHydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [badgeBumping, setBadgeBumping] = useState(false);

  const count = cartItemCount !== undefined ? cartItemCount : isHydrated ? totalItems : 0;
  const handleOpen = onOpenCart || openCart;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (count > 0) {
      setBadgeBumping(true);
      const timer = setTimeout(() => setBadgeBumping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-emdad-border'
          : 'bg-white/90 backdrop-blur-xs border-b border-emdad-border/70'
      }`}
    >
      <div className="mx-auto flex h-16 md:h-20 max-w-container items-center justify-between px-4 md:px-8">
        
        {/* Brand Section / Back button */}
        <div className="flex items-center gap-3">
          {isSubpage ? (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 rounded-xl border border-emdad-border bg-white px-3.5 py-2 text-sm font-semibold text-emdad-text-main hover:border-emdad-primary hover:bg-slate-50 transition-all duration-200 active:scale-95"
              aria-label="العودة للصفحة السابقة"
            >
              <ArrowRight className="h-4 w-4 text-emdad-primary" />
              <span>العودة</span>
            </button>
          ) : (
            <Link href="/" className="group flex items-center gap-3 focus:outline-hidden">
              <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border border-emdad-sky/30 overflow-hidden shadow-xs bg-white shrink-0">
                <Image
                  src="/brand/emdad_logo_identity.jpg"
                  alt="شعار إمداد لمستلزمات طب الأسنان"
                  fill
                  sizes="(max-width: 768px) 40px, 48px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-cairo text-lg md:text-2xl font-extrabold text-emdad-primary tracking-tight leading-none group-hover:text-emdad-primary-dark transition-colors">
                  إمداد
                </span>
                <span className="text-[10px] md:text-xs font-semibold text-emdad-turquoise tracking-wider uppercase leading-tight mt-0.5">
                  EMDAD DENTAL
                </span>
              </div>
            </Link>
          )}

          {isSubpage && pageTitle && (
            <span className="text-base md:text-lg font-bold text-emdad-text-main border-r border-emdad-border pr-3 mr-1">
              {pageTitle}
            </span>
          )}
        </div>

        {/* Center Tagline pill on desktop */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emdad-sky-light/60 border border-emdad-sky/30 text-xs text-emdad-primary font-medium">
          <span>متجر التجهيزات والمستهلكات السنية الشامل</span>
        </div>

        {/* Quick Actions (WhatsApp Contact & Cart Trigger) */}
        <div className="flex items-center gap-2 md:gap-4">
          <a
            href="https://wa.me/963981276182"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل عبر واتساب"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-semibold"
          >
            <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
            <span dir="ltr">+963 981 276 182</span>
          </a>

          {/* Floating Cart Trigger Button */}
          <button
            type="button"
            onClick={handleOpen}
            aria-label={`سلة المشتريات (${count} منتج)`}
            data-testid="header-cart-button"
            className="relative flex items-center justify-center h-10 w-10 md:h-11 md:w-11 rounded-full bg-emdad-50 text-emdad-primary hover:bg-emdad-100 hover:text-emdad-primary-dark transition-all duration-200 border border-emdad-sky/30 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emdad-sky/40 cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5 md:h-5.5 md:w-5.5" />
            <span
              data-testid="header-cart-badge"
              className={`absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emdad-turquoise px-1 text-[11px] font-bold text-white shadow-xs transition-transform duration-300 ${
                badgeBumping ? 'scale-125 bg-emdad-primary' : 'scale-100'
              }`}
            >
              {count > 99 ? '99+' : count}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}

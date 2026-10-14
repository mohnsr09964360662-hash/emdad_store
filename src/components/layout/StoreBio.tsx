'use client';

import React from 'react';
import { MessageCircle, Instagram } from 'lucide-react';

interface StoreBioProps {
  whatsappNumber?: string;
  instagramUrl?: string;
}

export function StoreBio({
  whatsappNumber = '963981276182',
  instagramUrl = 'https://www.instagram.com/emdad6911',
}: StoreBioProps) {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <section className="w-full max-w-2xl mx-auto px-4 text-center mt-3 mb-6">
      {/* Store Title */}
      <h1 className="text-2xl md:text-4xl font-extrabold text-emdad-text-main font-cairo tracking-tight">
        إمداد
      </h1>

      {/* Subtitle */}
      <p className="text-sm md:text-base font-semibold text-emdad-primary mt-1">
        مستلزمات طب الأسنان
      </p>

      {/* Tagline */}
      <div className="flex items-center justify-center gap-3 my-2.5">
        <span className="h-px w-8 bg-emdad-turquoise/40" />
        <p className="text-xs md:text-sm font-bold text-emdad-teal tracking-wide">
          — مستلزماتك ... بين يديك —
        </p>
        <span className="h-px w-8 bg-emdad-turquoise/40" />
      </div>

      {/* Bio Description */}
      <p className="text-xs md:text-sm text-emdad-text-muted max-w-lg mx-auto leading-relaxed">
        متجر يقدم جميع الأدوات ومستلزمات ومواد طب الأسنان والتعويضات السنية للطلاب والعيادات في كافة المحافظات السورية.
      </p>

      {/* Circular Floating Action Buttons (WhatsApp & Instagram) */}
      <div className="flex items-center justify-center gap-4 mt-5 z-20">
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل مع المتجر عبر واتساب (+963 981 276 182)"
          className="group flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full bg-white text-emerald-600 shadow-md border border-slate-100 hover:scale-110 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 focus:outline-hidden"
          title="واتساب: +963 981 276 182"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-105 transition-transform" />
        </a>

        {/* Instagram Button */}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تابع حساب إنستغرام الرسمي (@emdad6911)"
          className="group flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full bg-white text-pink-600 shadow-md border border-slate-100 hover:scale-110 hover:shadow-lg hover:border-pink-200 transition-all duration-300 focus:outline-hidden"
          title="إنستغرام: @emdad6911"
        >
          <Instagram className="h-6 w-6 group-hover:scale-105 transition-transform" />
        </a>
      </div>
    </section>
  );
}

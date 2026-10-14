'use client';

import React from 'react';
import Image from 'next/image';

interface CircularLogoProps {
  logoSrc?: string;
  altText?: string;
}

export function CircularLogo({
  logoSrc = '/brand/emdad_logo_identity.jpg',
  altText = 'شعار متجر إمداد لمستلزمات طب الأسنان',
}: CircularLogoProps) {
  return (
    <div
      className="relative z-20 flex items-center justify-center mx-auto"
      style={{
        ['--logo-size' as string]: 'clamp(6rem, 13vw, 13rem)',
        ['--logo-pull' as string]: 'calc(var(--logo-size) / 2)',
        marginTop: 'calc(var(--logo-pull) * -1)',
      }}
    >
      <div
        className="group relative flex items-center justify-center aspect-square rounded-full bg-white border-4 md:border-[6px] border-white shadow-[0_8px_24px_rgba(13,92,150,0.15)] overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95"
        style={{
          width: 'var(--logo-size)',
          height: 'var(--logo-size)',
        }}
      >
        <div className="relative w-full h-full p-2 md:p-3 flex items-center justify-center bg-white">
          <Image
            src={logoSrc}
            alt={altText}
            width={208}
            height={208}
            priority
            className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Subtle inner highlight border */}
        <div className="absolute inset-0 rounded-full border border-emdad-sky/20 pointer-events-none" />
      </div>
    </div>
  );
}

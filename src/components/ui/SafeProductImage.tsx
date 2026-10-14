'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

export function SafeProductImage({
  src,
  alt,
  className = '',
  fill = false,
  priority = false,
}: SafeProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-emdad-sky-light/40 to-slate-100 p-4 ${className}`}
        aria-label={alt}
      >
        {/* Emdad Tooth Vector Fallback */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-emdad-turquoise opacity-75"
        >
          <path
            d="M32 6C23 6 14 14 17 28C19 37 25 49 29 54C31 56 33 56 35 54C39 49 45 37 47 28C50 14 41 6 32 6Z"
            fill="url(#emdad-fallback-grad)"
          />
          <path
            d="M26 22C28 26 36 26 38 22"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="emdad-fallback-grad" x1="17" y1="6" x2="47" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14B8A6" />
              <stop offset="1" stopColor="#0D5C96" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${fill ? 'h-full w-full' : ''}`}>
      {isLoading && (
        <div className="skeleton-shimmer absolute inset-0 z-10" />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? 300 : undefined}
        height={!fill ? 300 : undefined}
        priority={priority}
        unoptimized={src.endsWith('.svg')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface CoverBannerProps {
  bannerSrc?: string;
  altText?: string;
}

export function CoverBanner({
  bannerSrc = '/brand/cover_banner.svg',
  altText = 'بانر متجر إمداد لمستلزمات وتجهيزات طب الأسنان',
}: CoverBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full max-w-container mx-auto">
      {/* 
        Curved Cover Banner
        - Rounded bottom concave shape: rounded-b-[10%]
        - Mobile aspect ratio: 430/132
        - Desktop aspect ratio: 1339/228.8
      */}
      <div className="relative w-full aspect-[430/132] md:aspect-[1339/228.8] rounded-b-[10%] overflow-hidden shadow-xs bg-gradient-to-r from-emdad-900 via-emdad-primary to-emdad-600">
        
        {/* Shimmer skeleton layer until loaded */}
        {!isLoaded && (
          <div className="absolute inset-0 skeleton-shimmer z-10" />
        )}

        {/* Vector SVG banner */}
        <Image
          src={bannerSrc}
          alt={altText}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1339px"
          className={`w-full h-full object-cover rounded-b-[10%] transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Subtle bottom gradient overlay for smooth contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-b-[10%]" />
      </div>
    </div>
  );
}

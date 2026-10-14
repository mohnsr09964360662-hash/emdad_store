// src/types/storefront.ts

export type ProductBadge = 'الأكثر مبيعاً' | 'جديد' | 'خصم';

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number; // Syrian Pounds (SYP - ل.س)
  originalPrice?: number; // Syrian Pounds (SYP - ل.س)
  categoryId: string;
  categoryName: string;
  image: string;
  unit: string;
  stock: number;
  badge?: ProductBadge;
  technicalSpecs?: string[];
  inStock?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  description?: string;
  iconName?: string;
  productCount?: number;
  featured?: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image?: string;
  bgGradient?: string;
  primaryPrice?: number;
  linkCategory?: string;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc';

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CoverBanner } from '@/components/layout/CoverBanner';
import { CircularLogo } from '@/components/layout/CircularLogo';
import { StoreBio } from '@/components/layout/StoreBio';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/storefront/HeroSlider';
import { CategoryChips } from '@/components/storefront/CategoryChips';
import { SearchFilterBar } from '@/components/storefront/SearchFilterBar';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ProductDetailModal } from '@/components/storefront/ProductDetailModal';
import { CATEGORIES } from '@/data/categories';
import { PRODUCTS } from '@/data/products';
import { PROMO_BANNERS } from '@/data/banners';
import { Product, Category, PromoBanner, SortOption } from '@/types/storefront';
import { useCart } from '@/context/CartContext';

// Helper to map DB Product to Storefront Product
function mapDbProduct(p: any): Product {
  let specs: string[] | undefined = undefined;
  if (Array.isArray(p.technicalSpecs)) {
    specs = p.technicalSpecs;
  } else if (typeof p.technicalSpecs === 'string' && p.technicalSpecs.trim()) {
    try {
      const parsed = JSON.parse(p.technicalSpecs);
      if (Array.isArray(parsed)) specs = parsed;
    } catch {
      specs = [p.technicalSpecs];
    }
  }

  return {
    id: p.id,
    sku: p.sku || '',
    name: p.nameAr || p.name || '',
    nameEn: p.nameEn || undefined,
    description: p.description || '',
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    categoryId: p.categoryId || (p.category ? p.category.slug || p.category.id : ''),
    categoryName: p.category ? p.category.nameAr : (p.categoryName || ''),
    image: p.image || '/images/products/composite-syringe.svg',
    unit: p.unit || 'قطعة',
    stock: typeof p.stock === 'number' ? p.stock : 0,
    badge: (p.badge as any) || undefined,
    technicalSpecs: specs,
    inStock: typeof p.stock === 'number' ? p.stock > 0 : true,
    isFeatured: !!p.isFeatured,
    featured: !!p.isFeatured,
    ...((p.category ? { category: p.category, categorySlug: p.category.slug } : {}) as any),
  };
}

// Helper to map DB Category to Storefront Category
function mapDbCategory(c: any): Category {
  return {
    id: c.id,
    slug: c.slug || c.id,
    name: c.nameAr || c.name || '',
    nameEn: c.nameEn || undefined,
    description: c.description || undefined,
    iconName: c.icon || c.iconName || 'Sparkles',
    productCount: c._count?.products ?? c.productCount,
    featured: true,
  };
}

// Helper to map DB Banner to Storefront PromoBanner
function mapDbBanner(b: any, index: number): PromoBanner {
  const gradients = [
    'from-emdad-primary via-emdad-primary-dark to-slate-900',
    'from-blue-900 via-sky-800 to-teal-800',
    'from-slate-900 via-emdad-primary to-teal-900',
  ];
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || '',
    badge: b.badge || undefined,
    image: b.image || '/images/banners/hero-banner-1.svg',
    bgGradient: b.bgGradient || gradients[index % gradients.length],
    primaryPrice: b.primaryPrice || undefined,
    linkCategory: b.linkCategory || b.ctaLink || undefined,
  };
}

export default function HomePage() {
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [banners, setBanners] = useState<PromoBanner[]>(PROMO_BANNERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch live database catalog on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchStorefrontData() {
      setIsLoading(true);
      try {
        const [resProd, resCat, resBan] = await Promise.allSettled([
          fetch(`/api/products?active=all&_t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
          fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
          fetch(`/api/banners?_t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
        ]);

        if (!isMounted) return;

        if (
          resProd.status === 'fulfilled' &&
          resProd.value?.success &&
          Array.isArray(resProd.value.products)
        ) {
          const activeProds = resProd.value.products.filter((p: any) => p.isActive !== false);
          setProducts(activeProds.map(mapDbProduct));
        }

        if (
          resCat.status === 'fulfilled' &&
          resCat.value?.success &&
          Array.isArray(resCat.value.categories)
        ) {
          if (resCat.value.categories.length > 0) {
            setCategories(resCat.value.categories.map(mapDbCategory));
          }
        }

        if (
          resBan.status === 'fulfilled' &&
          resBan.value?.success &&
          Array.isArray(resBan.value.banners)
        ) {
          const activeBanners = resBan.value.banners.filter((b: any) => b.isActive !== false);
          if (activeBanners.length > 0) {
            setBanners(activeBanners.map((b: any, idx: number) => mapDbBanner(b, idx)));
          }
        }
      } catch (err) {
        console.warn('[Storefront] Error loading live DB data, using seed fallback:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStorefrontData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Arabic search normalization helper
  const normalizeArabic = (text: string) =>
    text
      .replace(/[\u064B-\u065F]/g, '') // strip tashkeel diacritics
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();

  // Filter and sort products reactively
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategoryId) {
      result = result.filter(
        (p) =>
          p.categoryId === selectedCategoryId ||
          (p as any).categorySlug === selectedCategoryId ||
          (p as any).category?.id === selectedCategoryId ||
          (p as any).category?.slug === selectedCategoryId
      );
    }

    // Search query filter (matches name, nameEn, description, sku, technicalSpecs)
    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery.trim());
      result = result.filter((p) => {
        const nameMatch = normalizeArabic(p.name).includes(q);
        const nameEnMatch = p.nameEn ? p.nameEn.toLowerCase().includes(q) : false;
        const descMatch = normalizeArabic(p.description).includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        const specsMatch = p.technicalSpecs
          ? p.technicalSpecs.some((s) => normalizeArabic(s).includes(q))
          : false;

        return nameMatch || nameEnMatch || descMatch || skuMatch || specsMatch;
      });
    }

    // Sort options
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategoryId, searchQuery, sortOption]);

  const activeCategory = categories.find(
    (c) => c.id === selectedCategoryId || c.slug === selectedCategoryId
  );

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product, quantity);
  };

  return (
    <div className="min-h-screen flex flex-col bg-emdad-bg selection:bg-emdad-sky/20 selection:text-emdad-primary">
      {/* 1. Header with dynamic cart counter */}
      <Header onOpenCart={openCart} />

      {/* 2. Main Canvas */}
      <main id="layout" className="flex-1 w-full pb-16">
        <CoverBanner />
        <CircularLogo />
        <StoreBio />

        {/* 3. Promotional Hero Carousel Slider */}
        <HeroSlider
          banners={banners}
          onSelectCategory={(catId) => setSelectedCategoryId(catId)}
        />

        {/* Catalog Section with Anchor for Smooth Scroll */}
        <section id="catalog-section" className="w-full">
          {/* 4. Category Filter Chips Bar */}
          <CategoryChips
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
          />

          {/* 5. Search & Sort Controls */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            totalResults={filteredProducts.length}
            activeCategoryName={activeCategory?.name}
            onClearCategory={() => setSelectedCategoryId(null)}
          />

          {/* 6. Responsive Product Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
          <ProductGrid
            products={filteredProducts}
            onOpenDetail={(product) => setSelectedProduct(product)}
            onAddToCart={handleAddToCart}
          />
        </section>

        {/* 7. Clinical Product Detail Modal Dialog */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}

// src/lib/products-store.ts
import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import prisma from '@/lib/prisma';

const DB_FILE = path.join('/tmp', 'emdad_products_db.json');

export interface StoredProduct {
  id: string;
  sku: string;
  nameAr: string;
  nameEn?: string | null;
  description: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  stock: number;
  badge?: string | null;
  technicalSpecs?: string[] | string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn?: string | null;
  };
}

function getInitialProducts(): StoredProduct[] {
  const catMap = new Map(CATEGORIES.map((c) => [c.id, c]));

  return PRODUCTS.map((p, idx) => {
    const cat = catMap.get(p.categoryId) || {
      id: p.categoryId,
      slug: p.categoryId,
      name: p.categoryName || 'مستلزمات عامة',
    };

    return {
      id: p.id || `prod-${idx + 1}`,
      sku: p.sku || `EMD-${idx + 1}`,
      nameAr: p.name,
      nameEn: p.nameEn || null,
      description: p.description || '',
      price: p.price,
      originalPrice: p.originalPrice || null,
      image: p.image || '/images/products/composite-syringe.svg',
      categoryId: p.categoryId,
      categoryName: p.categoryName || cat.name,
      unit: p.unit || 'قطعة',
      stock: p.stock ?? 25,
      badge: p.badge || null,
      technicalSpecs: p.technicalSpecs || null,
      isFeatured: !!p.featured || !!p.isFeatured,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: cat.id,
        slug: cat.slug || cat.id,
        nameAr: cat.name,
        nameEn: cat.nameEn || null,
      },
    };
  });
}

export function loadAllProducts(): StoredProduct[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[ProductsStore] Error reading cache file:', err);
  }

  // First-time initialization
  const initial = getInitialProducts();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
  } catch (writeErr) {
    console.warn('[ProductsStore] Could not write initial cache:', writeErr);
  }
  return initial;
}

export function saveAllProducts(products: StoredProduct[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.warn('[ProductsStore] Failed to save products cache:', err);
  }
}

export async function getProductsFromStore(filter?: {
  category?: string | null;
  search?: string | null;
  active?: string | null;
  sort?: string | null;
}): Promise<StoredProduct[]> {
  // 1. Try to load from SQLite Prisma first
  let dbProducts: any[] = [];
  try {
    const where: any = {};
    if (filter?.active !== 'all') {
      where.isActive = true;
    }
    if (filter?.category && filter.category !== 'all') {
      where.OR = [
        { categoryId: filter.category },
        { category: { slug: filter.category } },
      ];
    }
    dbProducts = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  } catch {
    // If Prisma query fails or DB is unavailable, continue with persistent cache
    dbProducts = [];
  }

  // 2. Load from dynamic cache
  const cachedProducts = loadAllProducts();

  // Merge: Cached products take precedence for recent edits/additions
  const map = new Map<string, StoredProduct>();
  for (const p of dbProducts) {
    map.set(p.id, {
      ...p,
      nameAr: p.nameAr,
      technicalSpecs: p.technicalSpecs,
      categoryName: p.category?.nameAr || p.categoryName,
    });
  }
  for (const cp of cachedProducts) {
    map.set(cp.id, cp);
  }

  let result = Array.from(map.values());

  // Apply filters
  if (filter?.active !== 'all') {
    result = result.filter((p) => p.isActive !== false);
  }
  if (filter?.category && filter.category !== 'all') {
    result = result.filter(
      (p) =>
        p.categoryId === filter.category ||
        p.category?.slug === filter.category ||
        p.category?.id === filter.category
    );
  }
  if (filter?.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.nameAr?.toLowerCase().includes(q) ||
        p.nameEn?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  // Apply sorting
  if (filter?.sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filter?.sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else {
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  return result;
}

export async function addProductToStore(productData: any): Promise<StoredProduct> {
  const all = loadAllProducts();

  const id = productData.id || `prod-${Date.now()}`;
  const sku = productData.sku || `EMD-${Date.now().toString().slice(-6)}`;

  const cat = CATEGORIES.find((c) => c.id === productData.categoryId) || {
    id: productData.categoryId || 'general',
    slug: productData.categoryId || 'general',
    name: 'مستلزمات عامة',
  };

  const newProduct: StoredProduct = {
    id,
    sku,
    nameAr: productData.nameAr?.trim() || productData.name?.trim() || 'منتج جديد',
    nameEn: productData.nameEn?.trim() || null,
    description: productData.description?.trim() || '',
    price: Math.max(0, Math.round(Number(productData.price) || 0)),
    originalPrice: productData.originalPrice ? Math.round(Number(productData.originalPrice)) : null,
    image: productData.image || '/images/products/composite-syringe.svg',
    categoryId: cat.id,
    categoryName: cat.name,
    unit: productData.unit?.trim() || 'قطعة',
    stock: productData.stock !== undefined ? Math.max(0, Number(productData.stock)) : 10,
    badge: productData.badge?.trim() || null,
    technicalSpecs: productData.technicalSpecs || null,
    isFeatured: Boolean(productData.isFeatured),
    isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: cat.id,
      slug: cat.slug || cat.id,
      nameAr: cat.name,
      nameEn: (cat as any).nameEn || null,
    },
  };

  all.unshift(newProduct);
  saveAllProducts(all);

  // Sync to Prisma SQLite in background if possible
  try {
    await prisma.product.upsert({
      where: { id: newProduct.id },
      create: {
        id: newProduct.id,
        sku: newProduct.sku,
        nameAr: newProduct.nameAr,
        nameEn: newProduct.nameEn,
        description: newProduct.description,
        price: newProduct.price,
        originalPrice: newProduct.originalPrice,
        image: newProduct.image,
        categoryId: newProduct.categoryId,
        unit: newProduct.unit,
        stock: newProduct.stock,
        badge: newProduct.badge,
        technicalSpecs: Array.isArray(newProduct.technicalSpecs)
          ? JSON.stringify(newProduct.technicalSpecs)
          : (newProduct.technicalSpecs as any) || null,
        isFeatured: newProduct.isFeatured,
        isActive: newProduct.isActive,
      },
      update: {
        nameAr: newProduct.nameAr,
        nameEn: newProduct.nameEn,
        description: newProduct.description,
        price: newProduct.price,
        originalPrice: newProduct.originalPrice,
        image: newProduct.image,
        categoryId: newProduct.categoryId,
        unit: newProduct.unit,
        stock: newProduct.stock,
        badge: newProduct.badge,
        technicalSpecs: Array.isArray(newProduct.technicalSpecs)
          ? JSON.stringify(newProduct.technicalSpecs)
          : (newProduct.technicalSpecs as any) || null,
        isFeatured: newProduct.isFeatured,
        isActive: newProduct.isActive,
      },
    });
  } catch (err) {
    console.warn('[ProductsStore] Prisma background sync notice:', err);
  }

  return newProduct;
}

export async function updateProductInStore(
  id: string,
  updateData: any
): Promise<StoredProduct | null> {
  const all = loadAllProducts();
  const index = all.findIndex((p) => p.id === id || p.sku === id);

  if (index === -1) {
    return null;
  }

  const existing = all[index];
  const cat = updateData.categoryId
    ? CATEGORIES.find((c) => c.id === updateData.categoryId) || existing.category
    : existing.category;

  const updated: StoredProduct = {
    ...existing,
    nameAr: updateData.nameAr !== undefined ? updateData.nameAr.trim() : existing.nameAr,
    nameEn: updateData.nameEn !== undefined ? updateData.nameEn?.trim() || null : existing.nameEn,
    sku: updateData.sku !== undefined ? updateData.sku.trim() : existing.sku,
    description: updateData.description !== undefined ? updateData.description.trim() : existing.description,
    price: updateData.price !== undefined ? Math.round(Number(updateData.price)) : existing.price,
    originalPrice:
      updateData.originalPrice !== undefined
        ? updateData.originalPrice
          ? Math.round(Number(updateData.originalPrice))
          : null
        : existing.originalPrice,
    image: updateData.image !== undefined ? updateData.image : existing.image,
    categoryId: updateData.categoryId !== undefined ? updateData.categoryId : existing.categoryId,
    categoryName: (cat as any)?.name || (cat as any)?.nameAr || existing.categoryName,
    unit: updateData.unit !== undefined ? updateData.unit.trim() : existing.unit,
    stock: updateData.stock !== undefined ? Math.max(0, Number(updateData.stock)) : existing.stock,
    badge: updateData.badge !== undefined ? updateData.badge?.trim() || null : existing.badge,
    technicalSpecs:
      updateData.technicalSpecs !== undefined
        ? updateData.technicalSpecs
        : existing.technicalSpecs,
    isFeatured:
      updateData.isFeatured !== undefined ? Boolean(updateData.isFeatured) : existing.isFeatured,
    isActive:
      updateData.isActive !== undefined ? Boolean(updateData.isActive) : existing.isActive,
    updatedAt: new Date().toISOString(),
    category: cat
      ? {
          id: cat.id,
          slug: cat.slug || cat.id,
          nameAr: (cat as any).nameAr || (cat as any).name || 'مستلزمات عامة',
          nameEn: (cat as any).nameEn || null,
        }
      : existing.category,
  };

  all[index] = updated;
  saveAllProducts(all);

  // Sync to Prisma SQLite in background
  try {
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        nameAr: updated.nameAr,
        nameEn: updated.nameEn,
        sku: updated.sku,
        description: updated.description,
        price: updated.price,
        originalPrice: updated.originalPrice,
        image: updated.image,
        categoryId: updated.categoryId,
        unit: updated.unit,
        stock: updated.stock,
        badge: updated.badge,
        technicalSpecs: Array.isArray(updated.technicalSpecs)
          ? JSON.stringify(updated.technicalSpecs)
          : (updated.technicalSpecs as any) || null,
        isFeatured: updated.isFeatured,
        isActive: updated.isActive,
      },
    });
  } catch (err) {
    console.warn('[ProductsStore] Prisma background update notice:', err);
  }

  return updated;
}

export async function deleteProductFromStore(id: string): Promise<boolean> {
  const all = loadAllProducts();
  const index = all.findIndex((p) => p.id === id || p.sku === id);

  if (index === -1) {
    return false;
  }

  // Soft delete or remove from list
  all.splice(index, 1);
  saveAllProducts(all);

  // Background Prisma delete / deactivate
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  } catch {
    // ignore
  }

  return true;
}

// src/app/admin/products/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  AlertCircle,
  Check,
  X,
  Upload,
  Loader2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { SafeProductImage } from '@/components/ui/SafeProductImage';

export interface AdminProduct {
  id: string;
  sku: string;
  nameAr: string;
  name?: string;
  nameEn?: string | null;
  description: string;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  category?: { id: string; slug: string; nameAr: string; nameEn?: string | null };
  categoryName?: string;
  image: string;
  unit: string;
  stock: number;
  badge?: string | null;
  technicalSpecs?: string[] | string | null;
  isFeatured?: boolean;
  isActive?: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<AdminProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | undefined>(undefined);
  const [formUnit, setFormUnit] = useState('');
  const [formStock, setFormStock] = useState<number>(10);
  const [formBadge, setFormBadge] = useState<string>('');
  const [formImage, setFormImage] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formSpecs, setFormSpecs] = useState<string>('');
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCatalog = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?active=all').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes.products || []);
      setCategories(Array.isArray(catRes) ? catRes : catRes.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormNameEn('');
    setFormSku(`EMD-${Date.now().toString().slice(-6)}`);
    setFormCategoryId(categories[0]?.id || 'restorative');
    setFormPrice(100000);
    setFormOriginalPrice(undefined);
    setFormUnit('قطعة واحدة');
    setFormStock(20);
    setFormBadge('');
    setFormImage('/images/products/composite-syringe.svg');
    setFormDescription('');
    setFormSpecs('');
    setFormIsFeatured(false);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: AdminProduct) => {
    setEditingProduct(p);
    setFormName(p.nameAr || p.name || '');
    setFormNameEn(p.nameEn || '');
    setFormSku(p.sku);
    setFormCategoryId(p.categoryId);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice ?? undefined);
    setFormUnit(p.unit);
    setFormStock(p.stock);
    setFormBadge(p.badge || '');
    setFormImage(p.image);
    setFormDescription(p.description);
    setFormSpecs(
      Array.isArray(p.technicalSpecs)
        ? p.technicalSpecs.join('\n')
        : typeof p.technicalSpecs === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(p.technicalSpecs);
              return Array.isArray(parsed) ? parsed.join('\n') : p.technicalSpecs;
            } catch {
              return p.technicalSpecs;
            }
          })()
        : ''
    );
    setFormIsFeatured(!!p.isFeatured);
    setFormIsActive(p.isActive !== false);
    setModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormImage(data.url);
      } else {
        alert(data.message || 'فشل رفع الصورة');
      }
    } catch (err) {
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim() || !formPrice) {
      alert('يرجى ملء الحقول الإلزامية المطلوبة');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nameAr: formName.trim(),
        nameEn: formNameEn.trim() || null,
        sku: formSku.trim(),
        categoryId: formCategoryId,
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : null,
        unit: formUnit.trim() || 'قطعة',
        stock: Number(formStock),
        badge: formBadge || null,
        image: formImage || '/images/products/composite-syringe.svg',
        description: formDescription.trim(),
        technicalSpecs: formSpecs
          ? formSpecs.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        isFeatured: formIsFeatured,
        isActive: formIsActive,
      };

      const endpoint = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'فشل حفظ المنتج');
      }

      setModalOpen(false);
      await fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    try {
      const res = await fetch(`/api/products/${deleteProduct.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'فشل حذف المنتج');
      }
      setDeleteProduct(null);
      await fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const pName = p.nameAr || p.name || '';
      const matchesSearch =
        pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' ||
        p.categoryId === selectedCategory ||
        p.category?.slug === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emdad-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-cairo">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            إدارة المنتجات والمواد الطبية
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            إدارة كتالوج المواد والأسعار والمخزون لعيادات ومراكز طب الأسنان ({products.length} مادة)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emdad-primary hover:bg-emdad-primary-dark text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المادة بالعربية، اللاتينية، أو رمز SKU..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emdad-primary focus:ring-2 focus:ring-emdad-sky/20 transition-all"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-emdad-primary focus:ring-2 focus:ring-emdad-sky/20 transition-all cursor-pointer"
          >
            <option value="ALL">كافة التصنيفات الطبية</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">الصورة</th>
                <th className="py-3 px-4">المادة ورمز SKU</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">السعر (ل.س)</th>
                <th className="py-3 px-4">التعبئة</th>
                <th className="py-3 px-4">المخزون</th>
                <th className="py-3 px-4">الشارة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    لم يتم العثور على أية مواد مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const pName = p.nameAr || p.name || '';
                  const categoryName =
                    p.category?.nameAr ||
                    categories.find((c) => c.id === p.categoryId || c.slug === p.categoryId)?.nameAr ||
                    categories.find((c) => c.id === p.categoryId || c.slug === p.categoryId)?.name ||
                    'عام';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden">
                          <SafeProductImage
                            src={p.image}
                            alt={pName}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{pName}</div>
                        {p.nameEn && (
                          <div className="text-[11px] text-slate-400 font-mono line-clamp-1" dir="ltr">
                            {p.nameEn}
                          </div>
                        )}
                        <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600" dir="ltr">
                          {p.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {categoryName}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div>{p.price.toLocaleString('ar-SY')} ل.س</div>
                        {p.originalPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {p.originalPrice.toLocaleString('ar-SY')} ل.س
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{p.unit}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.stock > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            متوفر ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            نفد المخزون
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.badge ? (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-emdad-primary border border-sky-200">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emdad-primary hover:bg-slate-100 transition-colors cursor-pointer"
                            title="تعديل المادة"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف المادة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base font-black text-slate-900">
                {editingProduct ? 'تعديل بيانات المادة السريرية' : 'إضافة مادة طبية جديدة'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المادة بالعربية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: كومبوزيت حشوات ضوئية Filtek Z250"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم العلمي بالإنكليزية
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="Filtek Z250 Universal Restorative"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز المادة SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="EMD-REST-001"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary text-left font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    التصنيف الطبي <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary cursor-pointer"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وحدة التعبئة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="محقنة 4 غرام"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر (ل.س) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary text-left"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر قبل الخصم (ل.س)
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={formOriginalPrice || ''}
                    onChange={(e) => setFormOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="اختياري"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الكمية المتوفرة (المخزون)
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary text-left"
                  />
                </div>
              </div>

              {/* Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  صورة المنتج ومسارها
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    <SafeProductImage src={formImage} alt="معاينة" className="w-12 h-12 object-contain" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      dir="ltr"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/images/products/..."
                      className="w-full rounded-xl border border-slate-200 py-1.5 px-3 text-xs text-left font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 text-xs text-emdad-primary font-bold hover:underline cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'جارٍ رفع الصورة...' : 'رفع صورة من الجهاز'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الوصف السريري والاستخدامات الطبية
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="وصف تفصيلي للمادة واستطباباتها..."
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary"
                />
              </div>

              {/* Technical specs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المواصفات التقنية (سطر لكل ميزة)
                </label>
                <textarea
                  rows={2}
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder="بلد المنشأ: ألمانيا&#10;زمن التصلب: 20 ثانية"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs focus:ring-2 focus:ring-emdad-sky/20 focus:border-emdad-primary"
                />
              </div>

              {/* Badge & Flags */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">الشارة:</label>
                  <select
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="rounded-lg border border-slate-200 py-1 px-2 text-xs"
                  >
                    <option value="">بدون شارة</option>
                    <option value="الأكثر مبيعاً">الأكثر مبيعاً</option>
                    <option value="جديد">جديد</option>
                    <option value="خصم">خصم</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded text-emdad-primary focus:ring-emdad-sky"
                  />
                  <span>منتج مميز (Featured)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-emdad-primary focus:ring-emdad-sky"
                  />
                  <span>مفعل ومعروض في المتجر</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emdad-primary hover:bg-emdad-primary-dark shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">تأكيد حذف المادة</h3>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من رغبتك في حذف مادة <span className="font-bold text-slate-800">"{deleteProduct.nameAr || deleteProduct.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

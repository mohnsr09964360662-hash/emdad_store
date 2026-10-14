// src/app/admin/banners/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Upload,
} from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [deleteBanner, setDeleteBanner] = useState<any>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCtaText, setFormCtaText] = useState('تسوق الآن');
  const [formCtaLink, setFormCtaLink] = useState('/#catalog-section');
  const [formOrder, setFormOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners?all=true');
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : data.banners || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = () => {
    setEditingBanner(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormBadge('');
    setFormImage('/images/banners/hero-banner-1.svg');
    setFormCtaText('تسوق الآن');
    setFormCtaLink('/#catalog-section');
    setFormOrder(banners.length + 1);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditingBanner(b);
    setFormTitle(b.title);
    setFormSubtitle(b.subtitle || '');
    setFormBadge(b.badge || '');
    setFormImage(b.image);
    setFormCtaText(b.ctaText || 'تسوق الآن');
    setFormCtaLink(b.ctaLink || '/#catalog-section');
    setFormOrder(b.order || 1);
    setFormIsActive(b.isActive !== false);
    setModalOpen(true);
  };

  const handleToggleActive = async (b: any) => {
    try {
      const res = await fetch(`/api/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (res.ok) {
        await fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImage.trim()) {
      alert('يرجى إدخال عنوان البانر ومسار الصورة');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        badge: formBadge.trim() || undefined,
        image: formImage.trim(),
        ctaText: formCtaText.trim() || undefined,
        ctaLink: formCtaLink.trim() || undefined,
        order: Number(formOrder),
        isActive: formIsActive,
      };

      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('فشل حفظ البانر');
      setModalOpen(false);
      await fetchBanners();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ البانر');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBanner) return;
    try {
      const res = await fetch(`/api/banners/${deleteBanner.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('فشل حذف البانر');
      setDeleteBanner(null);
      await fetchBanners();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emdad-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-cairo">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            البانرات الترويجية لسلايدر المتجر
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            إدارة عروض السلايدر الرئيسي في الصفحة الرئيسية ({banners.length} بانرات)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emdad-primary hover:bg-emdad-primary-dark text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بانر جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col"
          >
            {/* Visual banner preview */}
            <div className="relative aspect-[1/0.4] bg-slate-900 overflow-hidden">
              <img
                src={b.image}
                alt={b.title}
                className="w-full h-full object-cover opacity-90"
              />
              {b.badge && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-emdad-turquoise text-white shadow-sm">
                  {b.badge}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{b.subtitle}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(b)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    b.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {b.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نشط بالمتجر</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>معطل</span>
                    </>
                  )}
                </button>

                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emdad-primary hover:bg-slate-50 cursor-pointer"
                    title="تعديل البانر"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteBanner(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="حذف البانر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">
                {editingBanner ? 'تعديل البانر الترويجي' : 'إضافة بانر جديد'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الرئيسي *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي / الوصف</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شارة العرض</label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="عروض التجهيز السريري"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مسار صورة البانر *</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    dir="ltr"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-mono text-left"
                    required
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نص زر التوجيه</label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رابط التوجيه</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formCtaLink}
                    onChange={(e) => setFormCtaLink(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-mono text-left"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الترتيب</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-emdad-primary hover:bg-emdad-primary-dark rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">تأكيد حذف البانر</h3>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من حذف البانر <span className="font-bold text-slate-800">"{deleteBanner.title}"</span>؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteBanner(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
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

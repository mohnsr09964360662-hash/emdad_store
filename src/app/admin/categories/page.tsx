// src/app/admin/categories/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteCategory, setDeleteCategory] = useState<any>(null);

  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Sparkles');
  const [formOrder, setFormOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormNameEn('');
    setFormSlug('');
    setFormDescription('');
    setFormIcon('Sparkles');
    setFormOrder(categories.length + 1);
    setModalOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormName(cat.nameAr || cat.name || '');
    setFormNameEn(cat.nameEn || '');
    setFormSlug(cat.slug || '');
    setFormDescription(cat.description || '');
    setFormIcon(cat.icon || 'Sparkles');
    setFormOrder(cat.order || 1);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      alert('يرجى إدخال اسم التصنيف والرمز اللاتيني');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nameAr: formName.trim(),
        nameEn: formNameEn.trim() || undefined,
        slug: formSlug.trim(),
        description: formDescription.trim(),
        icon: formIcon.trim() || 'Sparkles',
        order: Number(formOrder),
      };

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'فشل حفظ التصنيف');
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      const res = await fetch(`/api/categories/${deleteCategory.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'فشل حذف التصنيف');
      }
      setDeleteCategory(null);
      await fetchCategories();
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
            تصنيفات المواد السريرية
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            إدارة الأقسام التخصصية في المتجر ({categories.length} أقسام)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emdad-primary hover:bg-emdad-primary-dark text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">الترتيب</th>
              <th className="py-3 px-4">اسم التصنيف بالعربية</th>
              <th className="py-3 px-4">الاسم اللاتيني / الرمز</th>
              <th className="py-3 px-4">عدد المنتجات</th>
              <th className="py-3 px-4">الوصف</th>
              <th className="py-3 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat, idx) => (
              <tr key={cat.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{cat.order || idx + 1}</td>
                <td className="py-3.5 px-4 font-bold text-slate-800">{cat.nameAr || cat.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500" dir="ltr">{cat.slug}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-sky-50 text-emdad-primary font-bold text-[11px]">
                    {cat.productCount ?? cat._count?.products ?? 0} مادة
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 line-clamp-1">{cat.description || '-'}</td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emdad-primary hover:bg-slate-100 transition-colors cursor-pointer"
                      title="تعديل التصنيف"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCategory(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف التصنيف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالعربية *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم اللاتيني / المعرف (Slug) *</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-mono text-left"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-left"
                />
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف المختصر</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
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
      {deleteCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">تأكيد حذف التصنيف</h3>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من حذف تصنيف <span className="font-bold text-slate-800">"{deleteCategory.nameAr || deleteCategory.name}"</span>؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCategory(null)}
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

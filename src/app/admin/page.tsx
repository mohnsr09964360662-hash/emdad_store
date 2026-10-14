// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  FolderTree,
  ShoppingCart,
  Coins,
  ArrowUpRight,
  PlusCircle,
  Sliders,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  ordersCount: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    referenceCode: string;
    customerName: string;
    customerPhone: string;
    governorate: string;
    subtotal: number;
    status: 'NEW' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    _count?: { items: number };
  }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [prodRes, catRes, orderRes] = await Promise.all([
          fetch('/api/products?active=all').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
          fetch('/api/orders').then((r) => r.json()),
        ]);

        const products = Array.isArray(prodRes) ? prodRes : (prodRes.products || []);
        const categories = Array.isArray(catRes) ? catRes : (catRes.categories || []);
        const orders = Array.isArray(orderRes) ? orderRes : (orderRes.orders || []);

        const revenue = orders
          .filter((o: any) => o.status !== 'CANCELLED')
          .reduce((sum: number, o: any) => sum + (o.subtotal || 0), 0);

        setStats({
          productsCount: products.length,
          categoriesCount: categories.length,
          ordersCount: orders.length,
          totalRevenue: revenue,
          recentOrders: orders.slice(0, 5),
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emdad-primary" />
      </div>
    );
  }

  const statusConfig = {
    NEW: { label: 'جديد', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    PROCESSING: { label: 'قيد المعالجة', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    COMPLETED: { label: 'مكتمل', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'ملغي', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          لوحة قيادة متجر إمداد
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          نظرة عامة على النشاط التجاري والمخزون الطبي وطلبات العيادات
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي المنتجات</span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.productsCount ?? 28}
            </span>
            <span className="text-[11px] font-semibold text-emdad-turquoise block mt-1">
              موزعة على {stats?.categoriesCount ?? 8} تصنيفات
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Categories */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">أقسام وتصنيفات المواد</span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.categoriesCount ?? 8}
            </span>
            <span className="text-[11px] font-semibold text-emdad-primary block mt-1">
              كافة الأقسام السريرية نشطة
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-emdad-primary flex items-center justify-center">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي طلبات العيادات</span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.ordersCount ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-amber-600 block mt-1">
              واردة من المحافظات السورية
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Revenue (SYP) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي المبيعات المحققة</span>
            <span className="text-xl font-black text-emerald-600">
              {(stats?.totalRevenue ?? 0).toLocaleString('ar-SY')} ل.س
            </span>
            <span className="text-[11px] font-semibold text-slate-400 block mt-1">
              بالليرة السورية
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fast Shortcuts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-sm font-black text-slate-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/products?action=new"
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emdad-primary hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emdad-primary" />
            <span>إضافة منتج جديد</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emdad-primary hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-amber-600" />
            <span>متابعة الطلبات</span>
          </Link>
          <Link
            href="/admin/banners"
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emdad-primary hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
          >
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>إدارة البانرات</span>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emdad-primary hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>معاينة واجهة المتجر</span>
          </a>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">أحدث طلبات العيادات</h2>
            <p className="text-xs text-slate-400 mt-0.5">آخر الطلبات الواردة من الأطباء والمراكز الطبية</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-emdad-primary hover:text-emdad-primary-dark flex items-center gap-1"
          >
            <span>عرض كافة الطلبات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">اسم الطبيب / المركز</th>
                <th className="py-3 px-4">المحافظة</th>
                <th className="py-3 px-4">قيمة الطلب</th>
                <th className="py-3 px-4">حالة الطلب</th>
                <th className="py-3 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    لا توجد طلبات واردة حالياً في قاعدة البيانات
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => {
                  const conf = statusConfig[order.status] || statusConfig.NEW;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emdad-primary" dir="ltr">
                        {order.referenceCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{order.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{order.governorate}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {order.subtotal.toLocaleString('ar-SY')} ل.س
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${conf.bg}`}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href="/admin/orders"
                          className="px-3 py-1 rounded-lg text-xs font-bold text-emdad-primary bg-sky-50 hover:bg-sky-100 transition-colors"
                        >
                          معاينة
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

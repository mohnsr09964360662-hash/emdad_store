// src/app/admin/orders/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Phone,
  MapPin,
  Clock,
  User,
  Building,
  FileText,
  X,
  ExternalLink,
  MessageCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productSku?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface AdminOrder {
  id: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  clinicAddress: string;
  notes?: string;
  subtotal: number;
  status: 'NEW' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('فشل تحديث حالة الطلب');

      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = activeTab === 'ALL' || o.status === activeTab;
      const matchesSearch =
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery) ||
        o.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.governorate.includes(searchQuery);

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      NEW: orders.filter((o) => o.status === 'NEW').length,
      PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
      COMPLETED: orders.filter((o) => o.status === 'COMPLETED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [orders]);

  const statusBadges = {
    NEW: { label: 'جديد', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    PROCESSING: { label: 'قيد المعالجة', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    COMPLETED: { label: 'مكتمل', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'ملغي', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          إدارة طلبات العيادات والمراكز
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          متابعة وتجهيز وتأكيد طلبيات المواد الطبية لجميع المحافظات السورية ({orders.length} طلب)
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
          {[
            { id: 'ALL', label: 'الكل', count: counts.ALL },
            { id: 'NEW', label: 'جديد', count: counts.NEW },
            { id: 'PROCESSING', label: 'قيد المعالجة', count: counts.PROCESSING },
            { id: 'COMPLETED', label: 'مكتمل', count: counts.COMPLETED },
            { id: 'CANCELLED', label: 'ملغي', count: counts.CANCELLED },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white text-emdad-primary shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-sky-100 text-emdad-primary'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالطبيب، الموبايل، كود الطلب..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emdad-primary focus:ring-2 focus:ring-emdad-sky/20 transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">اسم الطبيب / العيادة</th>
                <th className="py-3 px-4">الموبايل والتواصل</th>
                <th className="py-3 px-4">المحافظة</th>
                <th className="py-3 px-4">المواد</th>
                <th className="py-3 px-4">الإجمالي (ل.س)</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    لا توجد طلبات مطابقة للمعايير المحددة
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const conf = statusBadges[o.status] || statusBadges.NEW;
                  const cleanPhone = o.customerPhone.replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('0')
                    ? '963' + cleanPhone.slice(1)
                    : cleanPhone;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emdad-primary" dir="ltr">
                        {o.referenceCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{o.customerName}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-700" dir="ltr">
                            {o.customerPhone}
                          </span>
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="محادثة واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{o.governorate}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {o.items?.length || 0} أصناف (
                        {o.items?.reduce((s, it) => s + it.quantity, 0) || 0} قطعة)
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {(o.subtotal || 0).toLocaleString('ar-SY')} ل.س
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${conf.bg}`}
                        >
                          {conf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-emdad-primary bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          معاينة الطلب
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs font-bold text-slate-400">تفاصيل الطلبية</span>
                <h2 className="text-lg font-black text-slate-900 font-mono" dir="ltr">
                  {selectedOrder.referenceCode}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Status Manager */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">تحديث حالة الطلب:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'NEW', label: 'جديد' },
                    { id: 'PROCESSING', label: 'قيد التجهيز' },
                    { id: 'COMPLETED', label: 'مكتمل ومسلّم' },
                    { id: 'CANCELLED', label: 'ملغي' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedOrder.status === st.id
                          ? 'bg-emdad-primary text-white border-emdad-primary shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer & Clinic Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  بيانات الطبيب والشحن
                </h3>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-800">{selectedOrder.customerName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700" dir="ltr">
                        {selectedOrder.customerPhone}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>محادثة واتساب</span>
                    </a>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600">
                      محافظة {selectedOrder.governorate} — {selectedOrder.clinicAddress}
                    </span>
                  </div>

                  {selectedOrder.notes && (
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-100 text-slate-500">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>ملاحظات: {selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Order Items */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  المواد والطلبيات ({selectedOrder.items?.length || 0})
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">المادة</th>
                        <th className="py-2.5 px-3 text-center">الكمية</th>
                        <th className="py-2.5 px-3 text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800 block">
                              {it.productName}
                            </span>
                            {it.productSku && (
                              <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                {it.productSku}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {it.quantity}
                          </td>
                          <td
                            className="py-2.5 px-3 text-left font-bold text-slate-900 whitespace-nowrap"
                            dir="ltr"
                          >
                            {it.totalPrice.toLocaleString()} ل.س
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between font-bold">
                    <span className="text-slate-700">المجموع الكلي:</span>
                    <span className="text-emdad-primary text-sm font-black">
                      {selectedOrder.subtotal.toLocaleString('ar-SY')} ل.س
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

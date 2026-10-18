// src/app/admin/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Sliders,
  ShoppingCart,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/products', label: 'إدارة المنتجات', icon: Package },
  { href: '/admin/categories', label: 'تصنيفات المتجر', icon: FolderTree },
  { href: '/admin/banners', label: 'البانرات الإعلانية', icon: Sliders },
  { href: '/admin/orders', label: 'طلبات الأطباء', icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // If we are on the login page, render children directly without admin shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    // Strict security check: On any page refresh (F5/Reload) or direct entry, require password!
    const hasActiveLoginSession =
      typeof window !== 'undefined' &&
      (window as any).__EMDAD_ACTIVE_SESSION__ === true;

    if (!hasActiveLoginSession) {
      if (typeof window !== 'undefined') {
        (window as any).__EMDAD_ACTIVE_SESSION__ = false;
      }
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        router.replace('/admin/login');
      });
      return;
    }

    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        setAdminUser(data.user);
      } catch (err) {
        router.replace('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-50 font-cairo">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emdad-primary" />
          <span className="text-sm font-bold text-slate-600">جارٍ التحقق من صلاحيات المدير...</span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      (window as any).__EMDAD_ACTIVE_SESSION__ = false;
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex font-cairo text-slate-800">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Sticky + Mobile Slide-over) */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-64 bg-white border-l border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emdad-primary text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 block leading-tight">
                إمداد للأسنان
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                لوحة الإدارة المركزية
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emdad-primary text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emdad-turquoise" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {/* Quick link to storefront */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold text-emdad-primary bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              عرض المتجر
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* Admin User Info & Logout */}
          <div className="pt-2 flex items-center justify-between">
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {adminUser?.name || 'المدير العام'}
              </span>
              <span className="text-[11px] text-slate-400 block truncate" dir="ltr">
                {adminUser?.email || 'admin@emdad-dental.com'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pr-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                متجر إمداد لمستلزمات الأسنان — النظام متصل
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-600 hover:text-emdad-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emdad-primary transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>معاينة المتجر المباشر</span>
            </a>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

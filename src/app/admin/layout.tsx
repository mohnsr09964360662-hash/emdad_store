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
  Smartphone,
  Download,
  CheckCircle2,
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

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

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
              title="تثبيت لوحة التحكم كتطبيق على هاتفك"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden xs:inline">تثبيت كـ تطبيق</span>
              <span className="xs:hidden">تطبيق</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-600 hover:text-emdad-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emdad-primary transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة المتجر المباشر</span>
            </a>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* PWA Install Instructions Modal for iOS & Android */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-emdad-primary flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">تثبيت التطبيق على الجوال</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  لهواتف أندرويد (Google Chrome):
                </span>
                <p className="text-emerald-800 pr-5">
                  اضغط على زر القائمة (ثلاث نقاط ⋮) في أعلى أو أسفل المتصفح، ثم اختر <strong>"تثبيت التطبيق (Install app)"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1.5">
                <span className="font-bold text-sky-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  لهواتف آيفون (Safari):
                </span>
                <p className="text-sky-800 pr-5">
                  اضغط على زر المشاركة بالأسفل <strong>(مربع وسهم للأعلى ⎋)</strong> ثم مرر للأسفل واضغط على <strong>"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</strong>.
                </p>
              </div>

              <p className="text-slate-500 text-[11px] text-center">
                ✨ سيظهر تطبيق "إمداد أدمن" مباشرة على شاشة جوالك الرئيسية كـ تطبيق حقيقي وسريع ومتزامن تلقائياً مع المتجر.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emdad-primary text-white font-bold text-xs hover:bg-emdad-primary-dark transition-all cursor-pointer shadow-xs"
            >
              فهمت ذلك، تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

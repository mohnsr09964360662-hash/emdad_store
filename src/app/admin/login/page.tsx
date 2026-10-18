// src/app/admin/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuickFill = () => {
    setEmail('Bahaa110968');
    setPassword('0968514260');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'بيانات الدخول غير صحيحة');
      }

      // Successful login -> Set active session memory flag & redirect to Admin Dashboard
      if (typeof window !== 'undefined') {
        (window as any).__EMDAD_ACTIVE_SESSION__ = true;
      }
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر تسجيل الدخول، يرجى المحاولة ثانية');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/30 p-4 font-cairo"
    >
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden">
          {/* Top Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emdad-primary via-emdad-sky to-emdad-turquoise" />

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 text-emdad-primary mb-4 shadow-xs">
              <ShieldCheck className="w-9 h-9 text-emdad-primary" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              إمداد لمستلزمات طب الأسنان
            </h1>
            <p className="text-xs font-semibold text-emdad-turquoise mt-1">
              لوحة الإدارة والتحكم المركزي
            </p>
          </div>

          {/* Quick Credentials Autofill Helper */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emdad-turquoise" />
                بيانات تسجيل الدخول:
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs font-bold text-emdad-primary hover:text-emdad-primary-dark underline cursor-pointer"
              >
                تعبئة تلقائية سريعة
              </button>
            </div>
            <div className="text-slate-500 font-mono text-[11px] space-y-0.5" dir="ltr">
              <div>User: Bahaa110968</div>
              <div>Pass: 0968514260</div>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Bahaa110968"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3.5 text-sm text-slate-800 placeholder:text-slate-400 text-left focus:outline-hidden focus:border-emdad-primary focus:ring-2 focus:ring-emdad-sky/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm text-slate-800 placeholder:text-slate-400 text-left focus:outline-hidden focus:border-emdad-primary focus:ring-2 focus:ring-emdad-sky/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emdad-primary hover:bg-emdad-primary-dark text-white font-bold py-3 px-4 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحقق والدخول...</span>
                </>
              ) : (
                <span>تسجيل الدخول إلى النظام</span>
              )}
            </button>
          </form>

          {/* Storefront return link */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emdad-primary transition-colors"
            >
              <span>العودة إلى واجهة المتجر الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

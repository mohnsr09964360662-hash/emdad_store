import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const cairo = localFont({
  src: './fonts/cairo.ttf',
  variable: '--font-cairo',
  display: 'swap',
  fallback: ['Cairo', 'Segoe UI', 'Tahoma', 'sans-serif'],
});

export const viewport: Viewport = {
  themeColor: '#0D5C96',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'إمداد لمستلزمات طب الأسنان | Emdad Dental',
  description: 'مستلزماتك ... بين يديك — متجر التجهيزات والمستهلكات السنية الشامل للعيادات والطلاب في سوريا',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'إمداد أدمن',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: '/brand/emdad_logo.jpg',
  },
  openGraph: {
    title: 'إمداد لمستلزمات طب الأسنان | Emdad Dental',
    description: 'مستلزماتك ... بين يديك — متجر التجهيزات والمستهلكات السنية الشامل',
    url: 'https://emdad-dental.sy',
    siteName: 'Emdad Dental',
    locale: 'ar_SY',
    type: 'website',
  },
};

import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartToast } from '@/components/cart/CartToast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <meta name="theme-color" content="#0284c7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="إمداد أدمن" />
        <link rel="apple-touch-icon" href="/brand/emdad_logo.jpg" />
        <link rel="manifest" href="/admin-manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col bg-emdad-bg text-emdad-text-main font-cairo antialiased selection:bg-emdad-sky/20 selection:text-emdad-primary">
        <CartProvider>
          {children}
          <CartDrawer />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}

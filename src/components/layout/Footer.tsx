import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Instagram, ShieldCheck, Truck, Clock, CreditCard } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-emdad-border mt-auto pt-10 pb-8 text-emdad-text-muted font-cairo">
      <div className="mx-auto max-w-container px-4 md:px-8">
        
        {/* Top 4 Clinical Guarantee Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-emdad-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emdad-bg">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emdad-sky-light text-emdad-primary">
              <ShieldCheck className="h-5 w-5 text-emdad-turquoise" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-emdad-text-main">جودة سريرية معتمدة</h4>
              <p className="text-[11px] text-gray-500">أدوات ومواد طبية أصلية</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-emdad-bg">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emdad-sky-light text-emdad-primary">
              <Truck className="h-5 w-5 text-emdad-sky" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-emdad-text-main">شحن لكافة المحافظات</h4>
              <p className="text-[11px] text-gray-500">دمشق وجميع المدن السورية</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-emdad-bg">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emdad-sky-light text-emdad-primary">
              <Clock className="h-5 w-5 text-emdad-teal" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-emdad-text-main">تأكيد فوري عبر واتساب</h4>
              <p className="text-[11px] text-gray-500">متابعة دقيقة لكل طلب</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-emdad-bg">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emdad-sky-light text-emdad-primary">
              <CreditCard className="h-5 w-5 text-emdad-primary" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-emdad-text-main">الدفع عند الاستلام</h4>
              <p className="text-[11px] text-gray-500">تسوية آمنة بالليرة السورية</p>
            </div>
          </div>
        </div>

        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-b border-emdad-border">
          
          {/* Column 1: Store Bio */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-cairo text-2xl font-bold text-emdad-primary">إمداد</span>
              <span className="text-xs text-emdad-turquoise font-semibold uppercase tracking-wider">
                Emdad Dental
              </span>
            </div>
            <p className="text-xs md:text-sm text-emdad-teal font-medium">
              — مستلزماتك ... بين يديك —
            </p>
            <p className="text-xs leading-relaxed text-gray-500">
              المتجر الإلكتروني الأول للمستلزمات والتعويضات السنية المعتمدة للعيادات والمراكز التخصصية وطلاب طب الأسنان في سوريا.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-emdad-text-main">أقسام المتجر الرئيسية</h3>
            <ul className="flex flex-col gap-2 text-xs text-gray-600">
              <li>
                <Link href="/?category=restorative" className="hover:text-emdad-primary transition-colors">
                  حشوات وترميم الأسنان
                </Link>
              </li>
              <li>
                <Link href="/?category=surgery" className="hover:text-emdad-primary transition-colors">
                  أدوات ومعدات الجراحة والقلع
                </Link>
              </li>
              <li>
                <Link href="/?category=endodontics" className="hover:text-emdad-primary transition-colors">
                  علاج العصب والجذور
                </Link>
              </li>
              <li>
                <Link href="/?category=sterilization" className="hover:text-emdad-primary transition-colors">
                  تعقيم ومكافحة العدوى
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-emdad-text-main">معلومات التواصل والتوصيل</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emdad-turquoise shrink-0" />
                <span>دمشق - الجمهورية العربية السورية</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emdad-primary shrink-0" />
                <a href="https://wa.me/963981276182" dir="ltr" className="hover:text-emdad-primary hover:underline">
                  +963 981 276 182
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600 shrink-0" />
                <a href="https://www.instagram.com/emdad6911" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 hover:underline">
                  @emdad6911
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Services & Guarantees */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-emdad-text-main">خدماتنا وضمانتنا</h3>
            <p className="text-xs leading-relaxed text-gray-500">
              جميع المواد والأدوات الطبية معقمة ومطابقة لأعلى معايير الجودة السريرية مع إمكانية الدفع عند الاستلام في العيادة.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emdad-50 text-emdad-primary text-[11px] font-semibold border border-emdad-sky/30">
                الدفع عند الاستلام (COD)
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                تأكيد فوري عبر واتساب
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© 2026 إمداد لمستلزمات طب الأسنان. جميع الحقوق محفوظة.</p>
          <p className="text-[11px]">تصميم وهندسة مخصصة لطب الأسنان — مستلزماتك ... بين يديك</p>
        </div>
      </div>
    </footer>
  );
}

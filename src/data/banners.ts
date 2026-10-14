// src/data/banners.ts
import { PromoBanner } from '@/types/storefront';

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'banner-1',
    title: 'أحدث التجهيزات والقبضات الضوئية',
    subtitle: 'قبضات توربين ألمانية، أجهزة تصليب لاسلكية، ومحددات ذروة متطورة بضمان معتمد',
    badge: 'عروض التجهيز السريري',
    image: '/images/banners/hero-banner-1.svg',
    bgGradient: 'from-emdad-primary via-emdad-primary-dark to-slate-900',
    primaryPrice: 2990000,
    linkCategory: 'equipment',
  },
  {
    id: 'banner-2',
    title: 'كومبوزيت ولواصق عاجية عالمية',
    subtitle: 'تشكيلة شاملة من المحاقن واللواصق الزجاجية والمصفوفات التشريحية الأصلية 100%',
    badge: 'حشوات وترميم الأسنان',
    image: '/images/banners/hero-banner-2.svg',
    bgGradient: 'from-blue-900 via-sky-800 to-teal-800',
    primaryPrice: 340000,
    linkCategory: 'restorative',
  },
  {
    id: 'banner-3',
    title: 'مستلزماتك ... بين يديك',
    subtitle: 'تغطية لكافة العيادات والمحافظات السورية مع شحن سريع ودفع عند الاستلام',
    badge: 'توصيل عيادي فوري',
    image: '/images/banners/hero-banner-3.svg',
    bgGradient: 'from-slate-900 via-emdad-primary to-teal-900',
    primaryPrice: 195000,
    linkCategory: 'sterilization',
  },
];

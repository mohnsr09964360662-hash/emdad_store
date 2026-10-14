// src/data/categories.ts
import { Category } from '@/types/storefront';

export const CATEGORIES: Category[] = [
  {
    id: 'restorative',
    slug: 'restorative',
    name: 'حشوات وترميم',
    nameEn: 'Restorative & Esthetic Dentistry',
    description: 'كومبوزيت، لواصق عاجية، أحماض تخريش، حشوات زجاجية، ومصفوفات تشريحية عالية الجودة',
    iconName: 'Sparkles',
    productCount: 4,
    featured: true,
  },
  {
    id: 'surgery',
    slug: 'surgery',
    name: 'أدوات الجراحة',
    nameEn: 'Oral Surgery & Extraction',
    description: 'قوالع ستانلس ستيل ألمانية وكورية، روافع جذور، خيوط جراحية حريرية، وحوامل إبر كربيد تنجستن',
    iconName: 'Scissors',
    productCount: 4,
    featured: true,
  },
  {
    id: 'endodontics',
    slug: 'endodontics',
    name: 'معالجة العصب',
    nameEn: 'Endodontics',
    description: 'مبارد روتاري مرنة، سيلر بيوسيراميكي ذاتي التصلب، أقماع غوتا مدرجة، وأقماع ورقية معقمة',
    iconName: 'Activity',
    productCount: 4,
    featured: true,
  },
  {
    id: 'sterilization',
    slug: 'sterilization',
    name: 'تعقيم ومكافحة العدوى',
    nameEn: 'Sterilization & Infection Control',
    description: 'أكياس أوتوكلاف ذاتية الإغلاق، بخاخات تطهير سريعة، محاليل إنزيمية، ومؤشرات كفاءة التعقيم Class 5',
    iconName: 'ShieldCheck',
    productCount: 4,
    featured: true,
  },
  {
    id: 'prophylaxis',
    slug: 'prophylaxis',
    name: 'تبييض وتنظيف',
    nameEn: 'Prophylaxis & Whitening',
    description: 'بكجات تبييض عيادي فوري، رؤوس أجهزة تقليح متوافقة، ومعاجين صقل وتلميع بنكهات منعشة',
    iconName: 'Sun',
    productCount: 3,
    featured: false,
  },
  {
    id: 'orthodontics',
    slug: 'orthodontics',
    name: 'تقويم الأسنان',
    nameEn: 'Orthodontics',
    description: 'حاصرات خزفية شفافة Roth، أسلاك سوبر نايتي حرارية، ومطاط ربط ملون عالي المرونة',
    iconName: 'Smile',
    productCount: 3,
    featured: false,
  },
  {
    id: 'disposables',
    slug: 'disposables',
    name: 'مستهلكات عامة',
    nameEn: 'General Disposables',
    description: 'قفازات نيتريل خالية من البودرة، ماصات لعاب مرنة برؤوس أمان، ومرايل مرضى عازلة للماء',
    iconName: 'Package',
    productCount: 3,
    featured: false,
  },
  {
    id: 'equipment',
    slug: 'equipment',
    name: 'أجهزة العيادة',
    nameEn: 'Clinic Equipment & Handpieces',
    description: 'قبضات توربين ضوئية LED، أجهزة تصليب ضوئي لاسلكية، وأجهزة قياس ذروة إلكترونية ملونة',
    iconName: 'Cpu',
    productCount: 3,
    featured: true,
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}

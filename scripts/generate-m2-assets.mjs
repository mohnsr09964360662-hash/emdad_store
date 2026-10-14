// scripts/generate-m2-assets.mjs
import fs from 'fs';
import path from 'path';

console.log('🎨 بدء توليد أصول الرسوم المتجهة (Vector SVG Assets) للمرحلة M2...\n');

const productsDir = path.resolve('public/images/products');
const bannersDir = path.resolve('public/images/banners');

fs.mkdirSync(productsDir, { recursive: true });
fs.mkdirSync(bannersDir, { recursive: true });

// -------------------------------------------------------------
// 1. توليد البانرات الثلاثة (Aspect ratio 1:0.4 -> 1200x480)
// -------------------------------------------------------------

const banner1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#072E4C" />
      <stop offset="50%" stop-color="#0D5C96" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="turqGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3DD9B3" />
      <stop offset="100%" stop-color="#14B8A6" />
    </linearGradient>
    <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="480" rx="32" fill="url(#bgGrad1)" />

  <!-- Abstract Clinical Wave & Grid Patterns -->
  <path d="M 0 340 C 300 280, 500 420, 800 320 C 1000 250, 1100 360, 1200 300 L 1200 480 L 0 480 Z" fill="#0EA5E9" opacity="0.12" />
  <path d="M 0 400 C 400 320, 700 440, 1000 360 C 1120 330, 1180 370, 1200 360 L 1200 480 L 0 480 Z" fill="#14B8A6" opacity="0.18" />

  <!-- Glowing Circular Halos -->
  <circle cx="980" cy="220" r="160" fill="#38BDF8" opacity="0.1" filter="url(#glow1)" />
  <circle cx="1060" cy="180" r="90" fill="#3DD9B3" opacity="0.15" filter="url(#glow1)" />

  <!-- Right Visual: Stylized High-Tech Dental Turbine & Tooth Monogram -->
  <g transform="translate(860, 100)">
    <!-- Glowing Tooth Aura -->
    <path d="M 120 40 C 90 40, 60 65, 70 110 C 76 140, 96 180, 110 195 C 116 201, 124 201, 130 195 C 144 180, 164 140, 170 110 C 180 65, 150 40, 120 40 Z" fill="none" stroke="url(#turqGrad)" stroke-width="6" opacity="0.8" />
    
    <!-- Dental Handpiece Turbine Silhouette -->
    <g transform="rotate(-35 120 120)">
      <rect x="105" y="20" width="30" height="180" rx="10" fill="#E0F2FE" opacity="0.9" />
      <rect x="110" y="30" width="20" height="150" rx="6" fill="#0D5C96" opacity="0.2" />
      <!-- Head -->
      <path d="M 100 20 L 140 20 L 135 -15 L 105 -15 Z" fill="#BAE6FD" />
      <circle cx="120" cy="-5" r="8" fill="#38BDF8" />
      <!-- Light beam -->
      <polygon points="120,-15 70,-80 170,-80" fill="url(#turqGrad)" opacity="0.35" filter="url(#glow1)" />
    </g>
    <!-- Sparkling Medical Stars -->
    <path d="M 60 70 L 65 85 L 80 90 L 65 95 L 60 110 L 55 95 L 40 90 L 55 85 Z" fill="#3DD9B3" opacity="0.9" />
    <path d="M 190 140 L 193 150 L 203 153 L 193 156 L 190 166 L 187 156 L 177 153 L 187 150 Z" fill="#38BDF8" opacity="0.8" />
  </g>

  <!-- Left Content: Arabic Promotional Typography -->
  <g transform="translate(100, 110)" text-anchor="start">
    <!-- Clinical Category Tag -->
    <rect x="0" y="0" width="180" height="36" rx="18" fill="rgba(20, 184, 166, 0.2)" stroke="#14B8A6" stroke-width="1.5" />
    <text x="90" y="23" font-family="Cairo, sans-serif" font-size="16" font-weight="700" fill="#3DD9B3" text-anchor="middle">عروض التجهيز السريري</text>

    <!-- Main Headline -->
    <text x="0" y="85" font-family="Cairo, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">أحدث التجهيزات والقبضات الضوئية</text>
    <text x="0" y="140" font-family="Cairo, sans-serif" font-size="36" font-weight="800" fill="#38BDF8">بأعلى المعايير وأفضل الأسعار لعيادتك</text>

    <!-- Subtitle -->
    <text x="0" y="195" font-family="Cairo, sans-serif" font-size="18" font-weight="500" fill="#E0F2FE" opacity="0.9">قبضات توربين ألمانية، أجهزة تصليب لاسلكية، ومحددات ذروة متطورة بضمان معتمد</text>

    <!-- CTA Button & Badges -->
    <g transform="translate(0, 235)">
      <rect x="0" y="0" width="190" height="50" rx="25" fill="url(#turqGrad)" />
      <text x="95" y="32" font-family="Cairo, sans-serif" font-size="18" font-weight="800" fill="#072E4C" text-anchor="middle">تصفح العروض الآن ←</text>

      <rect x="210" y="5" width="150" height="40" rx="20" fill="rgba(255,255,255,0.12)" stroke="#BAE6FD" stroke-width="1" />
      <text x="285" y="30" font-family="Cairo, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">⚡ حسم يصل إلى 20%</text>
    </g>
  </g>
</svg>`;

const banner2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B4D7E" />
      <stop offset="50%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>

  <rect width="1200" height="480" rx="32" fill="url(#bgGrad2)" />

  <circle cx="1020" cy="240" r="180" fill="#FFFFFF" opacity="0.08" />
  <circle cx="940" cy="160" r="110" fill="#38BDF8" opacity="0.15" />

  <!-- Right Visual: Composite Syringes & Restorative Tooth -->
  <g transform="translate(870, 110)">
    <!-- Natural Tooth Crown -->
    <path d="M 120 50 C 85 50, 60 80, 65 130 C 70 170, 95 210, 115 225 C 118 227, 122 227, 125 225 C 145 210, 170 170, 175 130 C 180 80, 155 50, 120 50 Z" fill="#FFFFFF" opacity="0.95" />
    <path d="M 105 85 C 95 105, 95 140, 110 160 C 120 175, 130 175, 135 160" fill="none" stroke="#E2E8F0" stroke-width="4" stroke-linecap="round" />

    <!-- 3M Composite Syringe Crossing -->
    <g transform="rotate(-40 100 140)">
      <rect x="70" y="40" width="22" height="140" rx="4" fill="#0F172A" />
      <rect x="74" y="60" width="14" height="60" fill="#F8FAFC" />
      <text x="81" y="95" font-family="sans-serif" font-size="10" font-weight="900" fill="#0D5C96" text-anchor="middle">A2</text>
      <!-- Plunger -->
      <rect x="77" y="180" width="8" height="40" fill="#64748B" />
      <rect x="68" y="215" width="26" height="8" rx="3" fill="#0F172A" />
      <!-- Nozzle -->
      <polygon points="76,40 86,40 83,15 79,15" fill="#38BDF8" />
    </g>
  </g>

  <!-- Left Content: Restorative Dental Materials -->
  <g transform="translate(100, 110)" text-anchor="start">
    <rect x="0" y="0" width="195" height="36" rx="18" fill="rgba(255, 255, 255, 0.2)" stroke="#FFFFFF" stroke-width="1.2" />
    <text x="97" y="23" font-family="Cairo, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">حشوات وترميم الأسنان</text>

    <text x="0" y="85" font-family="Cairo, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">كومبوزيت ولواصق عاجية عالمية</text>
    <text x="0" y="140" font-family="Cairo, sans-serif" font-size="34" font-weight="800" fill="#FDE68A">أصلية 100% من 3M و GC و Tor VM</text>

    <text x="0" y="195" font-family="Cairo, sans-serif" font-size="18" font-weight="500" fill="#F0F9FF" opacity="0.95">تشكيلة شاملة من المحاقن واللواصق الزجاجية والمصفوفات التشريحية للعيادات</text>

    <g transform="translate(0, 235)">
      <rect x="0" y="0" width="200" height="50" rx="25" fill="url(#goldGrad)" />
      <text x="100" y="32" font-family="Cairo, sans-serif" font-size="18" font-weight="900" fill="#072E4C" text-anchor="middle">اطلب مستلزماتك الآن ←</text>

      <rect x="220" y="5" width="160" height="40" rx="20" fill="rgba(0,0,0,0.2)" stroke="#FDE68A" stroke-width="1" />
      <text x="300" y="30" font-family="Cairo, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">⭐ ضمان الجودة السريرية</text>
    </g>
  </g>
</svg>`;

const banner3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#072E4C" />
      <stop offset="60%" stop-color="#0D5C96" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#3DD9B3" />
    </linearGradient>
  </defs>

  <rect width="1200" height="480" rx="32" fill="url(#bgGrad3)" />

  <!-- Delivery & Medical Supply Logistics Graphic -->
  <g transform="translate(850, 110)">
    <!-- Circular Shield Background -->
    <circle cx="130" cy="130" r="120" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" stroke-width="2" />
    
    <!-- Delivery Medical Box -->
    <g transform="translate(50, 60)">
      <rect x="40" y="50" width="90" height="70" rx="10" fill="#FFFFFF" />
      <polygon points="40,50 85,20 175,20 130,50" fill="#E2E8F0" />
      <polygon points="130,50 175,20 175,90 130,120" fill="#CBD5E1" />
      <!-- Medical Cross on Parcel -->
      <rect x="75" y="65" width="20" height="40" rx="3" fill="#0D5C96" />
      <rect x="65" y="75" width="40" height="20" rx="3" fill="#0D5C96" />
    </g>
    <!-- Speed Lines -->
    <path d="M 20 110 L 60 110" stroke="#3DD9B3" stroke-width="4" stroke-linecap="round" />
    <path d="M 10 135 L 55 135" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" />
    <path d="M 30 160 L 65 160" stroke="#3DD9B3" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- Left Content: Syrian Coverage & WhatsApp -->
  <g transform="translate(100, 110)" text-anchor="start">
    <rect x="0" y="0" width="210" height="36" rx="18" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" stroke-width="1.2" />
    <text x="105" y="23" font-family="Cairo, sans-serif" font-size="16" font-weight="700" fill="#38BDF8" text-anchor="middle">توصيل عيادي فوري ومباشر</text>

    <text x="0" y="85" font-family="Cairo, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">مستلزماتك ... بين يديك</text>
    <text x="0" y="140" font-family="Cairo, sans-serif" font-size="34" font-weight="800" fill="#3DD9B3">تغطية لكافة العيادات والمحافظات السورية</text>

    <text x="0" y="195" font-family="Cairo, sans-serif" font-size="18" font-weight="500" fill="#E0F2FE" opacity="0.95">دمشق، ريف دمشق، حلب، حمص، اللاذقية وكافة المدن | دعم واتساب: 182 276 981 963+</text>

    <g transform="translate(0, 235)">
      <rect x="0" y="0" width="220" height="50" rx="25" fill="url(#accentGrad)" />
      <text x="110" y="32" font-family="Cairo, sans-serif" font-size="18" font-weight="900" fill="#072E4C" text-anchor="middle">طلب مباشر عبر واتساب ←</text>

      <rect x="240" y="5" width="160" height="40" rx="20" fill="rgba(255,255,255,0.12)" stroke="#BAE6FD" stroke-width="1" />
      <text x="320" y="30" font-family="Cairo, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">📦 الدفع عند الاستلام</text>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(bannersDir, 'hero-banner-1.svg'), banner1, 'utf8');
fs.writeFileSync(path.join(bannersDir, 'hero-banner-2.svg'), banner2, 'utf8');
fs.writeFileSync(path.join(bannersDir, 'hero-banner-3.svg'), banner3, 'utf8');
console.log('✅ تم حفظ البانرات الثلاثة بنجاح في public/images/banners/');

// -------------------------------------------------------------
// 2. توليد المنتجات السريرية الـ 28 (ViewBox 400x400)
// -------------------------------------------------------------

function generateProductSvg(filename, titleAr, titleEn, drawContent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#E0F2FE" />
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9" />
      <stop offset="50%" stop-color="#CBD5E1" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <linearGradient id="emdadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0D5C96" />
    </linearGradient>
    <linearGradient id="turqGradProd" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3DD9B3" />
      <stop offset="100%" stop-color="#14B8A6" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0D5C96" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Clean Clinical Background -->
  <rect width="400" height="400" rx="24" fill="url(#cardBg)" />
  <circle cx="200" cy="180" r="140" fill="#FFFFFF" opacity="0.65" />
  <circle cx="200" cy="180" r="110" fill="none" stroke="#BAE6FD" stroke-width="1.5" stroke-dasharray="6 6" />

  <!-- Specific Illustrated Dental Geometry -->
  <g id="illustration" filter="url(#softShadow)">
    ${drawContent}
  </g>

  <!-- Watermark Clinical Indicator -->
  <g transform="translate(20, 360)">
    <rect x="0" y="0" width="360" height="26" rx="8" fill="#FFFFFF" opacity="0.9" stroke="#E2E8F0" stroke-width="1" />
    <text x="180" y="17" font-family="Cairo, sans-serif" font-size="12" font-weight="700" fill="#0D5C96" text-anchor="middle">
      ${titleAr} • ${titleEn}
    </text>
  </g>
</svg>`;

  fs.writeFileSync(path.join(productsDir, filename), svg, 'utf8');
}

// 1. Composite Syringe
generateProductSvg(
  'composite-syringe.svg',
  'كومبوزيت نانو هايبرد Z250',
  '3M Filtek Z250 A2',
  `<!-- Syringe Body -->
  <g transform="translate(100, 110) rotate(-25 100 100)">
    <rect x="50" y="70" width="130" height="34" rx="6" fill="#1E293B" />
    <rect x="80" y="74" width="70" height="26" fill="#FFFFFF" rx="3" />
    <text x="115" y="92" font-family="sans-serif" font-size="14" font-weight="900" fill="#0D5C96" text-anchor="middle">3M A2</text>
    <!-- Graduations -->
    <line x1="60" y1="70" x2="60" y2="80" stroke="#94A3B8" stroke-width="2" />
    <line x1="70" y1="70" x2="70" y2="80" stroke="#94A3B8" stroke-width="2" />
    <!-- Screw Plunger -->
    <rect x="180" y="80" width="45" height="14" fill="#64748B" />
    <rect x="220" y="68" width="16" height="38" rx="4" fill="#1E293B" />
    <!-- Angled Nozzle -->
    <polygon points="50,78 30,82 15,105 18,108 34,88 50,92" fill="#0EA5E9" />
    <!-- Extruded Composite Drop -->
    <circle cx="15" cy="112" r="5" fill="#FDE68A" />
  </g>`
);

// 2. Bonding Agent
generateProductSvg(
  'bonding-agent.svg',
  'لاصق عاج وميناء شامل',
  'Single Bond Universal 5ml',
  `<!-- Bottle -->
  <g transform="translate(140, 80)">
    <rect x="20" y="80" width="80" height="130" rx="14" fill="#0D5C96" />
    <rect x="26" y="90" width="68" height="110" rx="8" fill="#0284C7" />
    <!-- Orange/Amber Cap -->
    <rect x="35" y="45" width="50" height="35" rx="8" fill="#F59E0B" />
    <polygon points="50,45 70,45 65,25 55,25" fill="#D97706" />
    <!-- Label -->
    <rect x="32" y="115" width="56" height="60" rx="4" fill="#FFFFFF" />
    <text x="60" y="135" font-family="sans-serif" font-size="11" font-weight="900" fill="#0D5C96" text-anchor="middle">Single Bond</text>
    <text x="60" y="152" font-family="sans-serif" font-size="9" font-weight="700" fill="#D97706" text-anchor="middle">Universal</text>
    <text x="60" y="166" font-family="sans-serif" font-size="8" font-weight="600" fill="#64748B" text-anchor="middle">5 ml</text>
    <!-- Liquid Droplet -->
    <path d="M 60 5 C 55 15, 48 25, 60 30 C 72 25, 65 15, 60 5 Z" fill="#FCD34D" opacity="0.9" />
  </g>`
);

// 3. Glass Ionomer
generateProductSvg(
  'glass-ionomer.svg',
  'حشوة زجاجية GC Fuji IX GP',
  'Glass Ionomer Fast Set',
  `<!-- Powder Jar & Liquid Bottle -->
  <g transform="translate(70, 100)">
    <!-- Powder Jar -->
    <rect x="30" y="60" width="100" height="120" rx="16" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3" />
    <rect x="25" y="40" width="110" height="25" rx="6" fill="#F59E0B" />
    <rect x="40" y="80" width="80" height="70" rx="4" fill="#FEF3C7" />
    <text x="80" y="110" font-family="sans-serif" font-size="14" font-weight="900" fill="#B45309" text-anchor="middle">GC Fuji IX</text>
    <text x="80" y="130" font-family="sans-serif" font-size="10" font-weight="700" fill="#475569" text-anchor="middle">POWDER 15g</text>
    
    <!-- Liquid Bottle -->
    <rect x="150" y="80" width="60" height="100" rx="10" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
    <rect x="162" y="55" width="36" height="25" rx="4" fill="#0D5C96" />
    <text x="180" y="130" font-family="sans-serif" font-size="9" font-weight="800" fill="#0D5C96" text-anchor="middle">LIQUID</text>
    <!-- Yellow Measuring Spoon -->
    <path d="M 210 160 L 250 80 Q 255 70 265 80 L 230 170 Z" fill="#FBBF24" />
  </g>`
);

// 4. Sectional Matrix
generateProductSvg(
  'sectional-matrix.svg',
  'مصفوفات قطعية تشريحية Tor VM',
  'Sectional Matrix & NiTi Clamps',
  `<!-- NiTi Ring & Contoured Bands -->
  <g transform="translate(90, 80)">
    <!-- Clamping Ring -->
    <path d="M 60 140 C 30 70, 190 70, 160 140" fill="none" stroke="#0D5C96" stroke-width="18" stroke-linecap="round" />
    <circle cx="60" cy="140" r="14" fill="#0284C7" />
    <circle cx="160" cy="140" r="14" fill="#0284C7" />
    <rect x="52" y="145" width="16" height="25" rx="3" fill="#38BDF8" />
    <rect x="152" y="145" width="16" height="25" rx="3" fill="#38BDF8" />
    
    <!-- Anatomical Metallic Matrix Band -->
    <g transform="translate(65, 130)">
      <path d="M 15 20 C 30 5, 60 5, 75 20 C 85 50, 5 50, 15 20 Z" fill="url(#metalGrad)" stroke="#64748B" stroke-width="1.5" />
      <circle cx="45" cy="22" r="3" fill="#475569" />
    </g>
    <!-- Silicone Wedge -->
    <polygon points="105,170 120,170 112,205" fill="#14B8A6" />
  </g>`
);

// 5. Surgical Forceps
generateProductSvg(
  'surgical-forceps.svg',
  'قوالع جراحية كورية للفكين',
  'Dental Extraction Forceps',
  `<!-- Extraction Forceps -->
  <g transform="translate(130, 60)">
    <!-- Beaks -->
    <path d="M 60 40 Q 55 10 45 15 Q 40 35 55 60 Z" fill="url(#metalGrad)" stroke="#475569" />
    <path d="M 80 40 Q 85 10 95 15 Q 100 35 85 60 Z" fill="url(#metalGrad)" stroke="#475569" />
    <!-- Joint Screw -->
    <circle cx="70" cy="75" r="12" fill="#64748B" stroke="#334155" stroke-width="2" />
    <circle cx="70" cy="75" r="5" fill="#E2E8F0" />
    <!-- Textured Cross-Hatched Handles -->
    <path d="M 65 85 Q 40 140 30 220 Q 38 225 48 220 Q 60 150 72 85 Z" fill="url(#metalGrad)" stroke="#475569" />
    <path d="M 75 85 Q 100 140 110 220 Q 102 225 92 220 Q 80 150 68 85 Z" fill="url(#metalGrad)" stroke="#475569" />
    <!-- Serration Lines -->
    <line x1="36" y1="140" x2="52" y2="140" stroke="#64748B" stroke-width="2" />
    <line x1="35" y1="160" x2="48" y2="160" stroke="#64748B" stroke-width="2" />
    <line x1="88" y1="140" x2="104" y2="140" stroke="#64748B" stroke-width="2" />
    <line x1="92" y1="160" x2="105" y2="160" stroke="#64748B" stroke-width="2" />
  </g>`
);

// 6. Root Elevators
generateProductSvg(
  'root-elevators.svg',
  'روافع جذور بين بير 3 قطع',
  'Bein Root Elevators Set',
  `<!-- Three Elevators (Straight & Curved) -->
  <g transform="translate(110, 70)">
    <!-- Center Straight Elevator -->
    <g transform="translate(70, 0)">
      <path d="M 12 110 Q 5 180 20 210 Q 35 180 28 110 Z" fill="url(#metalGrad)" stroke="#475569" stroke-width="2" />
      <rect x="17" y="50" width="6" height="60" fill="url(#metalGrad)" />
      <!-- Sharp Gouge Blade -->
      <polygon points="17,50 23,50 20,20" fill="#F8FAFC" stroke="#64748B" stroke-width="1.5" />
    </g>
    <!-- Left Curved Elevator -->
    <g transform="translate(20, 20) rotate(-15 20 100)">
      <path d="M 12 110 Q 5 180 20 210 Q 35 180 28 110 Z" fill="url(#metalGrad)" stroke="#475569" />
      <rect x="17" y="50" width="6" height="60" fill="url(#metalGrad)" />
      <path d="M 20 50 Q 15 30 5 25" fill="none" stroke="#F8FAFC" stroke-width="4" stroke-linecap="round" />
    </g>
    <!-- Right Curved Elevator -->
    <g transform="translate(120, 20) rotate(15 20 100)">
      <path d="M 12 110 Q 5 180 20 210 Q 35 180 28 110 Z" fill="url(#metalGrad)" stroke="#475569" />
      <rect x="17" y="50" width="6" height="60" fill="url(#metalGrad)" />
      <path d="M 20 50 Q 25 30 35 25" fill="none" stroke="#F8FAFC" stroke-width="4" stroke-linecap="round" />
    </g>
  </g>`
);

// 7. Surgical Sutures
generateProductSvg(
  'surgical-sutures.svg',
  'خيوط جراحية حريرية كولك 3-0',
  'Silk 3-0 Surgical Sutures',
  `<!-- Suture Foil Pack & Curved Needle -->
  <g transform="translate(80, 80)">
    <!-- Foil Packet -->
    <rect x="20" y="30" width="130" height="180" rx="10" fill="#0D5C96" stroke="#072E4C" stroke-width="3" />
    <rect x="30" y="45" width="110" height="150" rx="6" fill="#F8FAFC" />
    <text x="85" y="75" font-family="sans-serif" font-size="20" font-weight="900" fill="#0D5C96" text-anchor="middle">SILK 3-0</text>
    <text x="85" y="95" font-family="sans-serif" font-size="10" font-weight="700" fill="#64748B" text-anchor="middle">Braided • Black • 75cm</text>
    <line x1="45" y1="108" x2="125" y2="108" stroke="#E2E8F0" stroke-width="2" />
    <!-- Curved Cutting Needle Icon -->
    <path d="M 65 145 A 25 25 0 0 1 105 145" fill="none" stroke="#0D5C96" stroke-width="3.5" />
    <polygon points="63,142 63,150 56,145" fill="#0D5C96" />
    
    <!-- Physical Curved Needle Floating -->
    <g transform="translate(140, 60)">
      <path d="M 40 30 A 45 45 0 0 1 90 90" fill="none" stroke="url(#metalGrad)" stroke-width="5" stroke-linecap="round" />
      <polygon points="90,90 94,84 98,92" fill="#475569" />
      <!-- Black Suture Thread Loop -->
      <path d="M 40 30 Q 15 50 25 90 Q 35 130 80 140 Q 110 130 90 90" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-dasharray="4 2" />
    </g>
  </g>`
);

// 8. Needle Holder
generateProductSvg(
  'needle-holder.svg',
  'حامل إبر جراحي ماثيو TC كربيد',
  'Mayo-Hegar TC Needle Holder',
  `<!-- TC Needle Holder with Gold Handles -->
  <g transform="translate(130, 50)">
    <!-- Serrated Tungsten Jaws -->
    <path d="M 60 30 L 63 80 L 77 80 L 80 30 Z" fill="url(#metalGrad)" stroke="#475569" />
    <line x1="70" y1="35" x2="70" y2="75" stroke="#CBD5E1" stroke-width="2" />
    <!-- Pivot Box Joint -->
    <circle cx="70" cy="85" r="10" fill="#64748B" />
    <!-- Shank and Ratchet -->
    <line x1="65" y1="95" x2="45" y2="175" stroke="#94A3B8" stroke-width="7" />
    <line x1="75" y1="95" x2="95" y2="175" stroke="#94A3B8" stroke-width="7" />
    <rect x="58" y="165" width="24" height="6" fill="#475569" />
    <!-- Gold TC Ring Handles -->
    <circle cx="35" cy="195" r="22" fill="none" stroke="url(#goldAccent)" stroke-width="8" />
    <circle cx="105" cy="195" r="22" fill="none" stroke="url(#goldAccent)" stroke-width="8" />
  </g>`
);

// 9. Rotary Files
generateProductSvg(
  'rotary-files.svg',
  'مبارد روتاري ProTaper Gold',
  'ProTaper Gold 6-Pack',
  `<!-- Blister Box with 6 Gold NiTi Files -->
  <g transform="translate(70, 70)">
    <rect x="20" y="20" width="220" height="200" rx="14" fill="#0F172A" stroke="#334155" stroke-width="3" />
    <rect x="30" y="30" width="200" height="40" rx="6" fill="#1E293B" />
    <text x="130" y="55" font-family="sans-serif" font-size="14" font-weight="900" fill="#F59E0B" text-anchor="middle">PROTAPER GOLD</text>
    
    <!-- 6 File Slots -->
    ${[0, 1, 2, 3, 4, 5]
      .map(
        (i) => `<g transform="translate(${45 + i * 30}, 80)">
      <!-- Latch Grip -->
      <rect x="6" y="0" width="10" height="25" rx="2" fill="#E2E8F0" />
      <rect x="4" y="25" width="14" height="8" rx="2" fill="${
        ['#F59E0B', '#94A3B8', '#EF4444', '#3B82F6', '#10B981', '#6B7280'][i]
      }" />
      <!-- Gold Flute Blade -->
      <polygon points="9,33 13,33 11,115" fill="url(#goldAccent)" />
      <!-- Spiral Lines -->
      <line x1="9" y1="45" x2="13" y2="50" stroke="#B45309" stroke-width="1.5" />
      <line x1="9" y1="65" x2="13" y2="70" stroke="#B45309" stroke-width="1.5" />
      <line x1="9" y1="85" x2="13" y2="90" stroke="#B45309" stroke-width="1.5" />
    </g>`
      )
      .join('')}
  </g>`
);

// 10. Bioceramic Sealer
generateProductSvg(
  'bioceramic-sealer.svg',
  'سيلر بيوسيراميك AH Plus',
  'AH Plus Bioceramic Sealer',
  `<!-- Dual Syringe & Flexible Capillary Tip -->
  <g transform="translate(90, 80) rotate(-20 100 100)">
    <rect x="60" y="70" width="110" height="36" rx="6" fill="#FFFFFF" stroke="#0D5C96" stroke-width="3" />
    <rect x="75" y="75" width="80" height="26" fill="#E0F2FE" />
    <text x="115" y="93" font-family="sans-serif" font-size="12" font-weight="900" fill="#0D5C96" text-anchor="middle">AH Plus Bioceramic</text>
    <!-- Plunger System -->
    <rect x="170" y="80" width="50" height="16" fill="#0284C7" />
    <rect x="215" y="66" width="14" height="44" rx="4" fill="#0D5C96" />
    <!-- Flexible Thin Needle Tip -->
    <polygon points="60,82 30,86 10,95" fill="none" stroke="#64748B" stroke-width="3" stroke-linecap="round" />
    <circle cx="10" cy="95" r="4" fill="#38BDF8" />
  </g>`
);

// 11. Gutta Percha
generateProductSvg(
  'gutta-percha.svg',
  'أقماع غوتا بيركا مدرجة 25/.04',
  'Gutta Percha Points ISO 25',
  `<!-- Slide Box with Gutta-Percha Cones -->
  <g transform="translate(90, 80)">
    <rect x="20" y="30" width="180" height="180" rx="12" fill="#FFFFFF" stroke="#0D5C96" stroke-width="3" />
    <rect x="20" y="30" width="180" height="40" rx="10" fill="#DC2626" />
    <text x="110" y="56" font-family="sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">ISO 25 • .04 TAPER</text>
    <!-- Points Compartment -->
    <rect x="35" y="85" width="150" height="110" rx="6" fill="#FEF2F2" />
    <!-- Pink Cones with Millimeter Lines -->
    ${[0, 1, 2, 3, 4]
      .map(
        (i) => `<g transform="translate(${50 + i * 26}, 95)">
      <polygon points="10,5 14,5 12,85" fill="#FDA4AF" />
      <polygon points="10,5 14,5 12,20" fill="#DC2626" />
      <!-- Millimeter marks -->
      <line x1="10" y1="40" x2="14" y2="40" stroke="#9F1239" stroke-width="1.5" />
      <line x1="10" y1="55" x2="14" y2="55" stroke="#9F1239" stroke-width="1.5" />
      <line x1="10" y1="70" x2="14" y2="70" stroke="#9F1239" stroke-width="1.5" />
    </g>`
      )
      .join('')}
  </g>`
);

// 12. Paper Points
generateProductSvg(
  'paper-points.svg',
  'أقماع ورقية معقمة لتجفيف القنوات',
  'Absorbent Paper Points ISO',
  `<!-- White Sterile Absorbent Points Box -->
  <g transform="translate(90, 80)">
    <rect x="20" y="30" width="180" height="180" rx="12" fill="#FFFFFF" stroke="#0D5C96" stroke-width="3" />
    <rect x="20" y="30" width="180" height="40" rx="10" fill="#0284C7" />
    <text x="110" y="56" font-family="sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">PAPER POINTS ISO</text>
    <rect x="35" y="85" width="150" height="110" rx="6" fill="#F0F9FF" />
    ${[0, 1, 2, 3, 4]
      .map(
        (i) => `<g transform="translate(${50 + i * 26}, 95)">
      <polygon points="10,5 14,5 12,85" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1" />
      <polygon points="10,5 14,5 12,18" fill="#38BDF8" />
      <line x1="10" y1="40" x2="14" y2="40" stroke="#64748B" stroke-width="1.5" />
      <line x1="10" y1="55" x2="14" y2="55" stroke="#64748B" stroke-width="1.5" />
    </g>`
      )
      .join('')}
  </g>`
);

// 13. Autoclave Pouches
generateProductSvg(
  'autoclave-pouches.svg',
  'أكياس تعقيم أوتوكلاف ذاتية الإغلاق',
  'Sterilization Pouches 90x230',
  `<!-- Autoclave Pouch with Transparent Film & Indicators -->
  <g transform="translate(100, 50)">
    <rect x="30" y="30" width="140" height="230" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" />
    <!-- Transparent Blue Film Layer -->
    <rect x="35" y="55" width="130" height="195" rx="4" fill="#38BDF8" opacity="0.3" stroke="#0284C7" stroke-width="1.5" />
    <!-- Chevron Seal Bottom -->
    <path d="M 35 230 L 100 250 L 165 230" fill="none" stroke="#0D5C96" stroke-width="3" />
    <!-- Self-Sealing Adhesive Flap -->
    <rect x="25" y="15" width="150" height="22" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1" />
    <line x1="30" y1="26" x2="170" y2="26" stroke="#EF4444" stroke-width="2" stroke-dasharray="6 3" />
    <!-- Steam / Gas Color Indicators -->
    <circle cx="55" cy="80" r="8" fill="#14B8A6" />
    <circle cx="55" cy="105" r="8" fill="#0D5C96" />
    <!-- Turbine Silhouette Inside Pouch -->
    <path d="M 100 90 L 100 190" stroke="#64748B" stroke-width="12" stroke-linecap="round" opacity="0.5" />
  </g>`
);

// 14. CaviCide Spray
generateProductSvg(
  'cavicide-spray.svg',
  'بخاخ تعقيم الأسطح الطبية CaviCide',
  'CaviCide Surface Disinfectant',
  `<!-- Spray Bottle -->
  <g transform="translate(120, 60)">
    <!-- Canister Body -->
    <rect x="40" y="100" width="80" height="160" rx="16" fill="#F8FAFC" stroke="#0D5C96" stroke-width="3" />
    <rect x="46" y="125" width="68" height="90" rx="6" fill="#E0F2FE" />
    <text x="80" y="160" font-family="sans-serif" font-size="14" font-weight="900" fill="#0D5C96" text-anchor="middle">CaviCide</text>
    <text x="80" y="180" font-family="sans-serif" font-size="9" font-weight="700" fill="#0284C7" text-anchor="middle">Surface Spray</text>
    <!-- Neck -->
    <rect x="68" y="75" width="24" height="25" fill="#CBD5E1" />
    <!-- Trigger Spray Head -->
    <rect x="55" y="45" width="55" height="30" rx="6" fill="#0D5C96" />
    <polygon points="55,50 20,55 35,70 55,65" fill="#0284C7" />
    <!-- Nozzle Mist -->
    <path d="M 20 57 L -5 45 M 20 57 L -10 57 M 20 57 L -5 70" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" />
  </g>`
);

// 15. Enzymatic Cleaner
generateProductSvg(
  'enzymatic-cleaner.svg',
  'منظف إنزيمي للألتراسونيك 1 لتر',
  'Triple Enzymatic Cleaner 1L',
  `<!-- 1-Liter Canister with Handle -->
  <g transform="translate(110, 60)">
    <rect x="30" y="70" width="120" height="180" rx="20" fill="#FFFFFF" stroke="#0D5C96" stroke-width="3" />
    <!-- Built-in Handle -->
    <path d="M 120 90 C 145 90, 145 160, 120 160" fill="none" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round" />
    <!-- Label -->
    <rect x="40" y="100" width="75" height="110" rx="8" fill="#14B8A6" />
    <text x="77" y="135" font-family="sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">ENZYMATIC</text>
    <text x="77" y="155" font-family="sans-serif" font-size="10" font-weight="700" fill="#E0F2FE" text-anchor="middle">Ultrasonic 1L</text>
    <!-- Cap -->
    <rect x="45" y="40" width="40" height="30" rx="6" fill="#0D5C96" />
  </g>`
);

// 16. Class 5 Indicators
generateProductSvg(
  'class5-indicators.svg',
  'مؤشرات كفاءة التعقيم الفئة الخامسة',
  'Class 5 Steam Integrators',
  `<!-- Integrator Strips with Moving Blue Front -->
  <g transform="translate(90, 110)">
    <!-- Strip 1 -->
    <rect x="20" y="30" width="180" height="60" rx="8" fill="#FFFFFF" stroke="#0D5C96" stroke-width="2.5" />
    <rect x="30" y="45" width="160" height="30" rx="4" fill="#F1F5F9" />
    <text x="50" y="65" font-family="sans-serif" font-size="10" font-weight="900" fill="#DC2626">REJECT</text>
    <text x="160" y="65" font-family="sans-serif" font-size="10" font-weight="900" fill="#10B981">ACCEPT</text>
    <!-- Blue Chemical Moving Front -->
    <rect x="75" y="52" width="75" height="16" rx="2" fill="#0D5C96" />
    <!-- Strip 2 Offset -->
    <g transform="translate(15, 60)">
      <rect x="20" y="30" width="180" height="60" rx="8" fill="#FFFFFF" stroke="#0D5C96" stroke-width="2.5" />
      <rect x="30" y="45" width="160" height="30" rx="4" fill="#F1F5F9" />
      <rect x="75" y="52" width="95" height="16" rx="2" fill="#14B8A6" />
    </g>
  </g>`
);

// 17. Whitening Kit
generateProductSvg(
  'whitening-kit.svg',
  'بكج تبييض عيادة فوتوشاين 35%',
  'In-Office Whitening 35% HP',
  `<!-- Dual Barrel Syringe & Mixing Tip -->
  <g transform="translate(100, 70) rotate(-25 100 100)">
    <!-- Dual Barrel Syringe -->
    <rect x="50" y="60" width="120" height="24" rx="4" fill="#38BDF8" opacity="0.8" />
    <rect x="50" y="86" width="120" height="24" rx="4" fill="#0D5C96" opacity="0.9" />
    <rect x="170" y="65" width="45" height="40" rx="4" fill="#64748B" />
    <!-- Mixing Spiral Tip -->
    <polygon points="50,65 20,78 20,92 50,105" fill="#E2E8F0" stroke="#94A3B8" />
    <polygon points="20,80 0,85 20,90" fill="#3DD9B3" />
    <!-- Gingival Barrier Syringe Alongside -->
    <g transform="translate(20, 70)">
      <rect x="50" y="60" width="90" height="16" rx="3" fill="#14B8A6" />
      <polygon points="50,63 30,68 50,73" fill="#0F172A" />
    </g>
    <!-- Sparkle Stars -->
    <path d="M 0 50 L 5 60 L 15 65 L 5 70 L 0 80 L -5 70 L -15 65 L -5 60 Z" fill="#FBBF24" />
  </g>`
);

// 18. Scaler Tips
generateProductSvg(
  'scaler-tips.svg',
  'رؤوس جهاز تنظيف الأسنان Woodpecker',
  'Ultrasonic Scaler Tips EMS',
  `<!-- Torque Wrench & 3 Scaler Tips -->
  <g transform="translate(100, 70)">
    <!-- Autoclave Case -->
    <rect x="20" y="20" width="160" height="200" rx="14" fill="#FFFFFF" stroke="#0D5C96" stroke-width="2.5" />
    <!-- 3 Stainless Tips -->
    ${[0, 1, 2]
      .map(
        (i) => `<g transform="translate(${40 + i * 45}, 40)">
      <rect x="15" y="70" width="12" height="40" rx="2" fill="url(#metalGrad)" />
      <!-- Curved Scaler Hook -->
      <path d="M 21 70 Q 21 30 ${i === 1 ? '5' : '35'} 25" fill="none" stroke="url(#metalGrad)" stroke-width="4.5" stroke-linecap="round" />
      <circle cx="21" cy="90" r="2" fill="#0D5C96" />
    </g>`
      )
      .join('')}
    <!-- Torque Wrench Silhouette -->
    <rect x="40" y="160" width="120" height="30" rx="8" fill="#E0F2FE" stroke="#38BDF8" stroke-width="1.5" />
    <circle cx="60" cy="175" r="8" fill="#0D5C96" />
  </g>`
);

// 19. Prophy Paste
generateProductSvg(
  'prophy-paste.svg',
  'معجون صقل وتلميع الأسنان بالنعناع',
  'Prophy Polishing Paste 250g',
  `<!-- Wide-Mouth Jar & Prophy Rubber Cup -->
  <g transform="translate(100, 80)">
    <rect x="30" y="70" width="140" height="120" rx="18" fill="#FFFFFF" stroke="#0D5C96" stroke-width="3" />
    <!-- Mint Green Lid -->
    <rect x="20" y="45" width="160" height="28" rx="8" fill="#10B981" />
    <!-- Mint Leaf Emblem -->
    <path d="M 100 110 C 80 90, 80 140, 100 150 C 120 140, 120 90, 100 110 Z" fill="#34D399" />
    <text x="100" y="175" font-family="sans-serif" font-size="12" font-weight="900" fill="#065F46" text-anchor="middle">MINT PROPHY</text>
    <!-- Prophy Cup -->
    <g transform="translate(140, 130)">
      <polygon points="10,0 30,0 25,25 15,25" fill="#3B82F6" />
      <rect x="18" y="25" width="4" height="20" fill="url(#metalGrad)" />
    </g>
  </g>`
);

// 20. Ceramic Brackets
generateProductSvg(
  'ceramic-brackets.svg',
  'حاصرات تقويمية خزفية شفافة Roth',
  'Ceramic Brackets Roth 0.022',
  `<!-- Tooth with Aesthetic Translucent Bracket -->
  <g transform="translate(100, 60)">
    <!-- Tooth Silhouette -->
    <path d="M 100 40 C 60 40, 45 70, 50 140 C 55 190, 85 220, 100 230 C 115 220, 145 190, 150 140 C 155 70, 140 40, 100 40 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
    <!-- Ceramic Bracket Body -->
    <rect x="75" y="110" width="50" height="50" rx="8" fill="#F8FAFC" opacity="0.9" stroke="#94A3B8" stroke-width="2" />
    <!-- Archwire Slot -->
    <rect x="70" y="130" width="60" height="8" fill="#0EA5E9" />
    <!-- 4 Tie Wings -->
    <circle cx="82" cy="118" r="4" fill="#38BDF8" />
    <circle cx="118" cy="118" r="4" fill="#38BDF8" />
    <circle cx="82" cy="152" r="4" fill="#38BDF8" />
    <circle cx="118" cy="152" r="4" fill="#38BDF8" />
  </g>`
);

// 21. NiTi Wires
generateProductSvg(
  'niti-wires.svg',
  'أسلاك تقويم سوبر نايتي حرارية',
  'Thermal NiTi Archwires',
  `<!-- Upper & Lower Dental Archwire Outlines -->
  <g transform="translate(100, 70)">
    <rect x="20" y="20" width="160" height="200" rx="14" fill="#0F172A" stroke="#334155" stroke-width="2" />
    <!-- Upper Arch Wire -->
    <path d="M 50 160 C 45 70, 155 70, 150 160" fill="none" stroke="url(#metalGrad)" stroke-width="5" stroke-linecap="round" />
    <!-- Center Dimple Indicator -->
    <circle cx="100" cy="85" r="4" fill="#DC2626" />
    <!-- Lower Arch Wire -->
    <path d="M 60 180 C 55 110, 145 110, 140 180" fill="none" stroke="url(#metalGrad)" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <text x="100" y="55" font-family="sans-serif" font-size="12" font-weight="900" fill="#38BDF8" text-anchor="middle">THERMAL NiTi</text>
  </g>`
);

// 22. Ortho Elastics
generateProductSvg(
  'ortho-elastics.svg',
  'مطاط ربط تقويمي ملون 1000 حلقة',
  'Orthodontic Ligature Ties Cane',
  `<!-- Ligature Ties Dispenser Stick with Colorful Rings -->
  <g transform="translate(110, 60)">
    <!-- Central Plastic Cane Stick -->
    <rect x="85" y="20" width="10" height="210" rx="5" fill="#E2E8F0" />
    ${[0, 1, 2, 3, 4, 5, 6]
      .map(
        (i) => `<g transform="translate(0, ${30 + i * 26})">
      <circle cx="65" cy="15" r="10" fill="none" stroke="${
        ['#0D5C96', '#0284C7', '#14B8A6', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'][i]
      }" stroke-width="4.5" />
      <circle cx="115" cy="15" r="10" fill="none" stroke="${
        ['#0D5C96', '#0284C7', '#14B8A6', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'][i]
      }" stroke-width="4.5" />
      <line x1="75" y1="15" x2="85" y2="15" stroke="#CBD5E1" stroke-width="3" />
      <line x1="95" y1="15" x2="105" y2="15" stroke="#CBD5E1" stroke-width="3" />
    </g>`
      )
      .join('')}
  </g>`
);

// 23. Nitrile Gloves
generateProductSvg(
  'nitrile-gloves.svg',
  'قفازات فحص طبية نيتريل زرقاء',
  'Blue Nitrile Examination Gloves',
  `<!-- Blue Glove Box with Pop-out Glove -->
  <g transform="translate(90, 80)">
    <rect x="20" y="50" width="180" height="120" rx="14" fill="#0284C7" stroke="#0369A1" stroke-width="2.5" />
    <!-- Oval Dispenser Opening -->
    <ellipse cx="110" cy="110" rx="50" ry="25" fill="#072E4C" />
    <!-- Pop-up Nitrile Glove Texture -->
    <path d="M 85 105 Q 100 60 115 105 Q 130 50 140 105" fill="#38BDF8" stroke="#0EA5E9" stroke-width="2" />
    <text x="50" y="80" font-family="sans-serif" font-size="12" font-weight="900" fill="#FFFFFF">NITRILE</text>
    <text x="50" y="96" font-family="sans-serif" font-size="9" font-weight="700" fill="#BAE6FD">100 Gloves • Blue</text>
  </g>`
);

// 24. Saliva Ejectors
generateProductSvg(
  'saliva-ejectors.svg',
  'ماصات لعاب بلاستيكية مرنة',
  'Disposable Saliva Ejectors 100 Pcs',
  `<!-- Curved Flexible Suction Tubes Bundle -->
  <g transform="translate(100, 70)">
    <!-- Suction Tube 1 -->
    <path d="M 60 210 L 60 90 A 30 30 0 0 1 120 90 L 120 120" fill="none" stroke="#38BDF8" stroke-width="12" stroke-linecap="round" opacity="0.85" />
    <!-- Soft Clear Tip with Suction Holes -->
    <rect x="112" y="115" width="16" height="20" rx="8" fill="#0D5C96" />
    <!-- Suction Tube 2 Offset -->
    <path d="M 80 210 L 80 80 A 30 30 0 0 1 140 80 L 140 110" fill="none" stroke="#BAE6FD" stroke-width="12" stroke-linecap="round" opacity="0.7" />
    <rect x="132" y="105" width="16" height="20" rx="8" fill="#0284C7" />
    <!-- Embedded Copper Wire Indication -->
    <path d="M 60 200 L 60 90 A 30 30 0 0 1 120 90" fill="none" stroke="#D97706" stroke-width="1.5" stroke-dasharray="4 2" />
  </g>`
);

// 25. Patient Bibs
generateProductSvg(
  'patient-bibs.svg',
  'مرايل مريض سنية ثلاثية الطبقات',
  '3-Ply Waterproof Dental Bibs',
  `<!-- Stack of Folded Sky Blue Waffle Bibs -->
  <g transform="translate(90, 80)">
    <!-- Base Stack -->
    <rect x="30" y="90" width="160" height="90" rx="10" fill="#0284C7" opacity="0.6" />
    <rect x="25" y="75" width="160" height="90" rx="10" fill="#38BDF8" opacity="0.8" />
    <rect x="20" y="60" width="160" height="90" rx="10" fill="#E0F2FE" stroke="#38BDF8" stroke-width="2" />
    <!-- Embossed Diamond/Waffle Grid Pattern -->
    <line x1="40" y1="75" x2="160" y2="75" stroke="#BAE6FD" stroke-width="2" stroke-dasharray="4 4" />
    <line x1="40" y1="95" x2="160" y2="95" stroke="#BAE6FD" stroke-width="2" stroke-dasharray="4 4" />
    <line x1="40" y1="115" x2="160" y2="115" stroke="#BAE6FD" stroke-width="2" stroke-dasharray="4 4" />
    <line x1="40" y1="135" x2="160" y2="135" stroke="#BAE6FD" stroke-width="2" stroke-dasharray="4 4" />
  </g>`
);

// 26. Dental Turbine
generateProductSvg(
  'dental-turbine.svg',
  'قبضة توربين ضوئية LED رشاش رباعي',
  'High-Speed LED Dental Turbine',
  `<!-- High-Tech Handpiece with LED Light & Water Jets -->
  <g transform="translate(90, 80) rotate(-35 110 110)">
    <!-- Main Body Handle -->
    <rect x="80" y="40" width="26" height="170" rx="8" fill="url(#metalGrad)" stroke="#475569" stroke-width="2" />
    <!-- Contoured Neck -->
    <path d="M 80 40 L 93 10 L 106 40 Z" fill="url(#metalGrad)" />
    <!-- Push-Button Head -->
    <rect x="82" y="-10" width="22" height="24" rx="6" fill="#64748B" />
    <circle cx="93" cy="-14" r="7" fill="#38BDF8" />
    <!-- High-Intensity LED Light Ray -->
    <polygon points="93,5 60,-35 126,-35" fill="#38BDF8" opacity="0.4" />
    <!-- 4 Water Spray Jets -->
    <circle cx="85" cy="5" r="2" fill="#BAE6FD" />
    <circle cx="101" cy="5" r="2" fill="#BAE6FD" />
    <circle cx="85" cy="15" r="2" fill="#BAE6FD" />
    <circle cx="101" cy="15" r="2" fill="#BAE6FD" />
    <!-- Quick Coupling Base -->
    <rect x="78" y="200" width="30" height="25" rx="3" fill="#334155" />
  </g>`
);

// 27. Curing Light
generateProductSvg(
  'curing-light.svg',
  'جهاز تصليب ضوئي لاسلكي 2500mw',
  'Cordless LED Curing Light Pen',
  `<!-- Curing Light Pen & Charging Base -->
  <g transform="translate(130, 40)">
    <!-- Sleek Pen Body -->
    <rect x="50" y="60" width="30" height="170" rx="12" fill="#FFFFFF" stroke="#0D5C96" stroke-width="2.5" />
    <!-- Digital OLED Display -->
    <rect x="56" y="100" width="18" height="24" rx="3" fill="#072E4C" />
    <text x="65" y="117" font-family="sans-serif" font-size="10" font-weight="900" fill="#38BDF8" text-anchor="middle">01s</text>
    <!-- Light Guide Rod -->
    <path d="M 65 60 L 65 20 Q 65 5 45 5" fill="none" stroke="#1E293B" stroke-width="8" stroke-linecap="round" />
    <!-- Intense Royal Blue Emission -->
    <polygon points="45,5 10,-15 10,25" fill="#2563EB" opacity="0.75" />
    <!-- Charging Cradle -->
    <path d="M 30 220 C 30 200, 100 200, 100 220 L 105 240 L 25 240 Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
  </g>`
);

// 28. Apex Locator
generateProductSvg(
  'apex-locator.svg',
  'جهاز محدد ذروة إلكتروني Woodpex V',
  'Woodpecker Woodpex V Apex Locator',
  `<!-- Desktop Console with Color Root Canal Display -->
  <g transform="translate(90, 70)">
    <rect x="20" y="30" width="180" height="170" rx="18" fill="#FFFFFF" stroke="#0D5C96" stroke-width="3" />
    <!-- Color Screen -->
    <rect x="35" y="45" width="150" height="110" rx="10" fill="#072E4C" />
    <!-- Root Canal Graphical Bar -->
    <path d="M 65 65 Q 110 90 140 135" fill="none" stroke="#64748B" stroke-width="12" stroke-linecap="round" />
    <!-- Apical Zone Highlight -->
    <circle cx="140" cy="135" r="10" fill="#10B981" />
    <text x="140" y="140" font-family="sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">0.0</text>
    <!-- Electrode Probe Cable -->
    <path d="M 110 200 C 110 230, 40 220, 30 250" fill="none" stroke="#64748B" stroke-width="3" />
    <circle cx="30" cy="250" r="5" fill="#F59E0B" />
  </g>`
);

console.log('✅ تم توليد كافة صور المنتجات الـ 28 المتجهة بنجاح في public/images/products/!');
console.log('🎉 اكتمل خط أنابيب الأصول المتجهة بنسبة 100% ودون أي انكسار أو اعتمادية خارجية.');

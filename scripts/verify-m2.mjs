// scripts/verify-m2.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 بدء الفحص والتحقق الآلي الصارم لمعايير المرحلة M2 لمتجر إمداد لطب الأسنان...\n');

let failed = false;
function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [نجاح] ${message}`);
  } else {
    console.error(`  ❌ [فشل] ${message}`);
    failed = true;
  }
}

// -------------------------------------------------------------
// 1. فحص وجود واكتمال ملفات الأصول المتجهة للبانرات الـ 3
// -------------------------------------------------------------
console.log('🖼️  1. فحص وجود البانرات الترويجية المتجهة (public/images/banners/):');
const expectedBanners = ['hero-banner-1.svg', 'hero-banner-2.svg', 'hero-banner-3.svg'];
for (const b of expectedBanners) {
  const bannerFile = path.resolve('public/images/banners', b);
  const exists = fs.existsSync(bannerFile);
  assert(exists, `وجود البانر: public/images/banners/${b}`);
  if (exists) {
    const size = fs.statSync(bannerFile).size;
    assert(size > 1000, `حجم البانر مناسب (${size} bytes)`);
  }
}

// -------------------------------------------------------------
// 2. فحص وجود واكتمال ملفات صور المنتجات الـ 28
// -------------------------------------------------------------
console.log('\n🦷 2. فحص وجود صور المنتجات السريرية الـ 28 (public/images/products/):');
const expectedProductSvgs = [
  'composite-syringe.svg',
  'bonding-agent.svg',
  'glass-ionomer.svg',
  'sectional-matrix.svg',
  'surgical-forceps.svg',
  'root-elevators.svg',
  'surgical-sutures.svg',
  'needle-holder.svg',
  'rotary-files.svg',
  'bioceramic-sealer.svg',
  'gutta-percha.svg',
  'paper-points.svg',
  'autoclave-pouches.svg',
  'cavicide-spray.svg',
  'enzymatic-cleaner.svg',
  'class5-indicators.svg',
  'whitening-kit.svg',
  'scaler-tips.svg',
  'prophy-paste.svg',
  'ceramic-brackets.svg',
  'niti-wires.svg',
  'ortho-elastics.svg',
  'nitrile-gloves.svg',
  'saliva-ejectors.svg',
  'patient-bibs.svg',
  'dental-turbine.svg',
  'curing-light.svg',
  'apex-locator.svg',
];

assert(expectedProductSvgs.length === 28, 'قائمة التحقق تحتوي على 28 منتجاً بالضبط');

let missingProductsCount = 0;
for (const p of expectedProductSvgs) {
  const prodFile = path.resolve('public/images/products', p);
  if (!fs.existsSync(prodFile)) {
    console.error(`     ❌ مفقود: public/images/products/${p}`);
    missingProductsCount++;
  }
}
assert(missingProductsCount === 0, 'جميع صور المنتجات الـ 28 موجودة محلياً دون أي ملف مفقود');

// -------------------------------------------------------------
// 3. فحص بنية البيانات ومواءمة الكتالوج (src/data/products.ts & categories.ts)
// -------------------------------------------------------------
console.log('\n📊 3. فحص ملفات البيانات (Categories & Products Data Integrity):');
const catPath = path.resolve('src/data/categories.ts');
const prodPath = path.resolve('src/data/products.ts');

assert(fs.existsSync(catPath), 'وجود ملف الفئات السريرية: src/data/categories.ts');
assert(fs.existsSync(prodPath), 'وجود ملف كتالوج المنتجات: src/data/products.ts');

if (fs.existsSync(catPath)) {
  const catContent = fs.readFileSync(catPath, 'utf8');
  assert(catContent.includes('CATEGORIES'), 'تصدير CATEGORIES في categories.ts');
  const catMatches = ['restorative', 'surgery', 'endodontics', 'sterilization', 'prophylaxis', 'orthodontics', 'disposables', 'equipment'];
  for (const c of catMatches) {
    assert(catContent.includes(`'${c}'`) || catContent.includes(`"${c}"`), `الفئة [${c}] معرفة في categories.ts`);
  }
}

if (fs.existsSync(prodPath)) {
  const prodContent = fs.readFileSync(prodPath, 'utf8');
  assert(prodContent.includes('PRODUCTS'), 'تصدير PRODUCTS في products.ts');

  // فحص عينات الأسعار والشارات والتصنيفات
  assert(prodContent.includes('150000') || prodContent.includes('150,000'), 'الحد الأدنى للأسعار (150,000 ل.س) موجود');
  assert(prodContent.includes('4850000') || prodContent.includes('4,850,000'), 'الحد الأعلى للأسعار (4,850,000 ل.س) موجود');
  assert(prodContent.includes('الأكثر مبيعاً'), 'شارة "الأكثر مبيعاً" موجودة ومطبقة');
  assert(prodContent.includes('جديد'), 'شارة "جديد" موجودة ومطبقة');
  assert(prodContent.includes('خصم'), 'شارة "خصم" موجودة ومطبقة');

  // التأكد من استدعاء كل صور الـ 28 منتج
  for (const imgName of expectedProductSvgs) {
    assert(prodContent.includes(imgName), `مسار الصورة ${imgName} مدمج في كتالوج المنتجات`);
  }
}

// -------------------------------------------------------------
// 4. فحص مكونات واجهة M2
// -------------------------------------------------------------
console.log('\n🧩 4. فحص مكونات واجهة M2:');
const requiredM2Components = [
  'src/components/ui/SafeProductImage.tsx',
  'src/components/ui/SkeletonShimmer.tsx',
  'src/components/storefront/HeroSlider.tsx',
  'src/components/storefront/CategoryChips.tsx',
  'src/components/storefront/SearchFilterBar.tsx',
  'src/components/storefront/ProductCard.tsx',
  'src/components/storefront/ProductGrid.tsx',
  'src/components/storefront/ProductDetailModal.tsx',
];

for (const compPath of requiredM2Components) {
  assert(fs.existsSync(path.resolve(compPath)), `وجود المكون: ${compPath}`);
}

// -------------------------------------------------------------
// 5. فحص خلو المشروع الصارم من آثار Gravity واللون الأخضر #60c984
// -------------------------------------------------------------
console.log('\n🧹 5. فحص خلو المشروع الصارم من علامات Gravity واللون الأخضر:');
const forbiddenTerms = ['60c984', 'gravity.dt', '0988896208', 'tajir.store'];
let leakFound = false;

function scanPath(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      if (file === 'node_modules' || file === '.next' || file === '.git') continue;
      scanPath(path.join(targetPath, file));
    }
  } else if (/\.(tsx|ts|jsx|js|mjs|json|css|svg)$/.test(targetPath)) {
    if (path.basename(targetPath) === 'verify-m2.mjs' || path.basename(targetPath) === 'verify-m1.mjs') return;
    const content = fs.readFileSync(targetPath, 'utf8');
    for (const term of forbiddenTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        console.error(`     تسرب للمصطلح المحظور "${term}" في الملف: ${targetPath}`);
        leakFound = true;
      }
    }
  }
}

scanPath(path.resolve('src'));
scanPath(path.resolve('public'));
scanPath(path.resolve('tailwind.config.ts'));
scanPath(path.resolve('next.config.mjs'));
assert(!leakFound, 'خلو تام للمصدر والبيانات من المصطلحات والألوان المحظورة');

// -------------------------------------------------------------
// 6. فحص تشغيل بناء الإنتاج (Next.js Production Build)
// -------------------------------------------------------------
console.log('\n🔨 6. تشغيل واختبار بناء الإنتاج (Next.js Production Build):');
try {
  execSync('node ./node_modules/next/dist/bin/next build', { stdio: 'inherit' });
  assert(true, 'اكتمل أمر البناء (Next.js build) بنجاح تام (Exit Code 0)');
} catch (err) {
  assert(false, 'فشل أمر البناء (Next.js build)');
}

console.log('\n=========================================');
if (failed) {
  console.error('❌ النتيجة: لم تكتمل كافة متطلبات التحقق للمرحلة M2 بنجاح.');
  process.exit(1);
} else {
  console.log('🎉 النتيجة: تم اجتياز جميع معايير التحقق للمرحلة M2 بنجاح تام وبأعلى جاهزية للإنتاج!');
  process.exit(0);
}

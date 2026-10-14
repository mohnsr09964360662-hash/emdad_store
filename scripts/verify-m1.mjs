import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 بدء التحقق الآلي من معايير المرحلة M1 لمتجر إمداد لطب الأسنان...\n');

let failed = false;
function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [نجاح] ${message}`);
  } else {
    console.error(`  ❌ [فشل] ${message}`);
    failed = true;
  }
}

// 1. فحص وجود أصول الهوية البصرية والخطوط
console.log('📁 1. فحص وجود خط أنابيب الأصول البصرية والخطوط:');
const logoPath = path.resolve('public/brand/emdad_logo_identity.jpg');
const faviconSvgPath = path.resolve('public/favicon.svg');
const faviconIcoPath = path.resolve('public/favicon.ico');
const bannerPath = path.resolve('public/brand/cover_banner.svg');
const cairoFontPublic = path.resolve('public/fonts/cairo.ttf');
const cairoFontApp = path.resolve('src/app/fonts/cairo.ttf');

assert(fs.existsSync(logoPath), 'وجود الشعار الرسمي: public/brand/emdad_logo_identity.jpg');
if (fs.existsSync(logoPath)) {
  const stat = fs.statSync(logoPath);
  assert(stat.size > 20000, `حجم الشعار مناسب (${Math.round(stat.size / 1024)} KB)`);
}

assert(fs.existsSync(faviconSvgPath), 'وجود أيقونة السن المتجهة: public/favicon.svg');
assert(fs.existsSync(faviconIcoPath), 'وجود أيقونة المتصفح: public/favicon.ico');
assert(fs.existsSync(bannerPath), 'وجود بانر الغلاف المتجه: public/brand/cover_banner.svg');
assert(fs.existsSync(cairoFontPublic), 'وجود خط القاهرة المحلي في public/fonts/cairo.ttf');
assert(fs.existsSync(cairoFontApp), 'وجود خط القاهرة المحلي في src/app/fonts/cairo.ttf');

// 2. فحص خلو المشروع تماماً من أي آثار لمتجر Gravity واللون الأخضر #60c984
console.log('\n🧹 2. فحص خلو الكود من آثار Gravity واللون الأخضر:');
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
    if (path.basename(targetPath) === 'verify-m1.mjs') return;
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
assert(!leakFound, 'خلو تام للمصدر والأصول من المصطلحات وأكواد الألوان المحظورة');

// 3. فحص مكونات واجهة M1
console.log('\n🧩 3. فحص وجود وتكامل مكونات M1:');
const requiredFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css',
  'src/components/layout/Header.tsx',
  'src/components/layout/CoverBanner.tsx',
  'src/components/layout/CircularLogo.tsx',
  'src/components/layout/StoreBio.tsx',
  'src/components/layout/Footer.tsx',
  'src/lib/utils.ts',
  'tailwind.config.ts',
];

for (const relPath of requiredFiles) {
  assert(fs.existsSync(path.resolve(relPath)), `وجود المكون / الملف: ${relPath}`);
}

// 4. فحص الرموز اللونية والهوية في ملفات التكوين والمكونات
console.log('\n🎨 4. فحص رموز الهوية البصرية وبيانات المتجر:');
const tailwindContent = fs.readFileSync(path.resolve('tailwind.config.ts'), 'utf8');
assert(tailwindContent.includes('#0D5C96'), 'رمز الكحلي الملكي (#0D5C96) موجود في Tailwind');
assert(tailwindContent.includes('#14B8A6'), 'رمز التركواز السريري (#14B8A6) موجود في Tailwind');
assert(tailwindContent.includes('#38BDF8'), 'رمز الأزرق السماوي (#38BDF8) موجود في Tailwind');
assert(tailwindContent.includes('#00A896'), 'رمز تيل الشعار اللفظي (#00A896) موجود في Tailwind');

const layoutContent = fs.readFileSync(path.resolve('src/app/layout.tsx'), 'utf8');
assert(layoutContent.includes('dir="rtl"'), 'سمة الاتجاه RTL موجودة في layout.tsx');
assert(layoutContent.includes('lang="ar"'), 'سمة اللغة العربية lang="ar" موجودة في layout.tsx');
assert(layoutContent.includes('#0D5C96'), 'وسم theme-color (#0D5C96) مضبوط في layout.tsx');

const bioContent = fs.readFileSync(path.resolve('src/components/layout/StoreBio.tsx'), 'utf8');
assert(bioContent.includes('963981276182'), 'رقم واتساب الرسمي متوفر في StoreBio');
assert(bioContent.includes('emdad6911'), 'حساب إنستغرام متوفر في StoreBio');
assert(bioContent.includes('مستلزماتك ... بين يديك'), 'الشعار اللفظي المعتمد موجود في StoreBio');

// 5. تشغيل بناء الإنتاج (npm run build)
console.log('\n🔨 5. تشغيل واختبار بناء الإنتاج (Next.js Production Build):');
try {
  execSync('node ./node_modules/next/dist/bin/next build', { stdio: 'inherit' });
  assert(true, 'اكتمل أمر البناء (Next.js build) بنجاح دون أي خطأ (Exit Code 0)');
} catch (err) {
  assert(false, 'فشل أمر البناء (Next.js build)');
}

console.log('\n=========================================');
if (failed) {
  console.error('❌ النتيجة: لم تكتمل كافة متطلبات التحقق للمرحلة M1 بنجاح.');
  process.exit(1);
} else {
  console.log('🎉 النتيجة: تم اجتياز جميع معايير التحقق للمرحلة M1 بنجاح تام وبأعلى معايير الجودة!');
  process.exit(0);
}

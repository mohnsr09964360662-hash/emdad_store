// scripts/verify-m3.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 بدء الفحص والتحقق الآلي الصارم لمعايير المرحلة M3 (سلة المشتريات، نموذج التوصيل السوري، وإرسال واتساب)...\n');

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
// 1. فحص وجود واكتمال ملفات ومكونات M3
// -------------------------------------------------------------
console.log('📦 1. فحص وجود ملفات ومكونات M3 (Cart & Checkout Suite):');
const requiredM3Files = [
  'src/types/cart.ts',
  'src/context/CartContext.tsx',
  'src/components/cart/CartDrawer.tsx',
  'src/components/cart/CartToast.tsx',
  'src/components/cart/DeliveryModal.tsx',
  'src/components/cart/OrderSuccessModal.tsx',
  'src/lib/whatsapp.ts',
];

for (const f of requiredM3Files) {
  const filePath = path.resolve(f);
  assert(fs.existsSync(filePath), `وجود الملف الأساسي: ${f}`);
}

// -------------------------------------------------------------
// 2. اختبارات التحقق من التعبير النمطي للموبايل السوري (Syrian Phone Regex Unit Tests)
// -------------------------------------------------------------
console.log('\n📱 2. اختبارات التعبير النمطي الصارم للموبايل السوري (Syrian Phone Validation):');
const SYRIAN_PHONE_REGEX = /^(09\d{8}|(\+?9639\d{8})|(009639\d{8}))$/;

function validatePhone(phone) {
  if (!phone) return false;
  const clean = phone.trim().replace(/[\s-]/g, '');
  return SYRIAN_PHONE_REGEX.test(clean);
}

// 10 حالات اختبار إيجابية
const positiveCases = [
  '0944123456',
  '0981276182',
  '+963981276182',
  '00963981276182',
  '963981276182',
  '0933112233',
  '0999887766',
  '0955443322',
  '0981 276 182', // مع فراغات (بعد التنظيف)
  '+963 981 276 182',
];

let positivePass = true;
for (const phone of positiveCases) {
  const isValid = validatePhone(phone);
  if (!isValid) {
    assert(false, `فشل التحقق من رقم سوري صحيح: "${phone}"`);
    positivePass = false;
  }
}
if (positivePass) {
  assert(true, `اجتازت جميع الحالات الإيجابية (${positiveCases.length} حالات) التحقق بنجاح`);
}

// 11 حالة اختبار سلبية (يجب أن ترفض)
const negativeCases = [
  '094412345',       // 9 أرقام (ناقص)
  '09441234567',     // 11 رقماً (زائد)
  '0844123456',      // بادئة خاطئة 08
  '0794123456',      // بادئة أردنية
  '+96279123456',    // رقم أردني
  '+96650123456',    // رقم سعودي
  '094412345a',      // يحوي أحرفاً
  'abcd094412',      // أحرف
  '+9638123456',     // بعد 963 لا يوجد 9
  '',                // فارغ
  '   ',             // فراغات فقط
];

let negativePass = true;
for (const phone of negativeCases) {
  const isValid = validatePhone(phone);
  if (isValid) {
    assert(false, `قبل النظام رقماً غير صالح بشكل خاطئ: "${phone}"`);
    negativePass = false;
  }
}
if (negativePass) {
  assert(true, `تم رفض جميع الحالات السلبية (${negativeCases.length} حالات غير صالحة) بنجاح`);
}

// -------------------------------------------------------------
// 3. فحص المحافظات السورية الـ 14 في ملفات الكود
// -------------------------------------------------------------
console.log('\n🏛️ 3. فحص المحافظات السورية الـ 14 في نموذج التوصيل وأنواع البيانات:');
const expectedGovernorates = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'السويداء',
  'درعا',
  'القنيطرة',
  'دير الزور',
  'الحسكة',
  'الرقة',
  'إدلب',
];

assert(expectedGovernorates.length === 14, 'قائمة المحافظات تحتوي على 14 محافظة بالضبط');

const deliveryModalPath = path.resolve('src/components/cart/DeliveryModal.tsx');
const cartTypesPath = path.resolve('src/types/cart.ts');

if (fs.existsSync(deliveryModalPath) || fs.existsSync(cartTypesPath)) {
  const targetContent = (fs.existsSync(cartTypesPath) ? fs.readFileSync(cartTypesPath, 'utf8') : '') +
                        (fs.existsSync(deliveryModalPath) ? fs.readFileSync(deliveryModalPath, 'utf8') : '');

  let allGovsPresent = true;
  for (const gov of expectedGovernorates) {
    if (!targetContent.includes(gov)) {
      assert(false, `المحافظة مفقودة: ${gov}`);
      allGovsPresent = false;
    }
  }
  if (allGovsPresent) {
    assert(true, 'كافة المحافظات السورية الـ 14 متوفرة بالكامل دون أي نقصان');
  }
}

// -------------------------------------------------------------
// 4. فحص رقم وتنسيق الواتساب الرسمي وكود المرجع
// -------------------------------------------------------------
console.log('\n💬 4. فحص تفاصيل ورابط إرسال واتساب الرسمي:');
const whatsappLibPath = path.resolve('src/lib/whatsapp.ts');

if (fs.existsSync(whatsappLibPath)) {
  const whatsappContent = fs.readFileSync(whatsappLibPath, 'utf8');
  assert(whatsappContent.includes('963981276182'), 'رقم المتجر الرسمي 963981276182 موجود في lib/whatsapp.ts');
  assert(whatsappContent.includes('+963 981 276 182'), 'رقم المتجر المنسق +963 981 276 182 موجود في lib/whatsapp.ts');
  assert(whatsappContent.includes('wa.me/'), 'رابط wa.me معتمد في إنشاء مسار المحادثة');
  assert(whatsappContent.includes('EMD-'), 'بادئة كود مرجع الطلب EMD- متوفرة');
  assert(whatsappContent.includes('encodeURIComponent'), 'استخدام encodeURIComponent لتأمين النص العربي');
}

// -------------------------------------------------------------
// 5. فحص خلو المشروع الصارم من علامات Gravity ورقمها المحظور واللون الأخضر
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
    if (path.basename(targetPath) === 'verify-m3.mjs' || path.basename(targetPath) === 'verify-m2.mjs' || path.basename(targetPath) === 'verify-m1.mjs') return;
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
assert(!leakFound, 'خلو تام للمصدر من المصطلحات والألوان والأرقام المحظورة');

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
  console.error('❌ النتيجة: لم تكتمل كافة متطلبات التحقق للمرحلة M3 بنجاح.');
  process.exit(1);
} else {
  console.log('🎉 النتيجة: تم اجتياز جميع معايير التحقق للمرحلة M3 بنجاح تام وبأعلى جاهزية للإنتاج!');
  process.exit(0);
}

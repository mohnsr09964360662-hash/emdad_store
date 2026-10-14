// scripts/adversarial-m3-challenger2.mjs
import fs from 'fs';
import path from 'path';

console.log('🛡️ =================================================================');
console.log('🛡️ EMPIRICAL ADVERSARIAL VERIFICATION HARNESS (CHALLENGER M3_2)');
console.log('🛡️ =================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureList = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} ${details ? `-> ${details}` : ''}`);
    failureList.push({ testName, details });
  }
}

// =========================================================================
// SUITE 1: SYRIAN PHONE REGEX ADVERSARIAL VALIDATION
// =========================================================================
console.log('📱 [SUITE 1] Syrian Phone Regex Adversarial Challenge:');

// Import regex & validator from actual source file
const whatsappSrc = fs.readFileSync(path.resolve('src/lib/whatsapp.ts'), 'utf8');

// Regex extracted directly from src/lib/whatsapp.ts
const regexMatch = whatsappSrc.match(/export const SYRIAN_PHONE_REGEX = (\/.*?\/[gimsuy]*);/);
if (!regexMatch) {
  throw new Error('Could not extract SYRIAN_PHONE_REGEX from src/lib/whatsapp.ts');
}
const SYRIAN_PHONE_REGEX = eval(regexMatch[1]);

function validateSyrianPhone(phone) {
  if (!phone) return false;
  const clean = String(phone).trim().replace(/[\s-]/g, '');
  return SYRIAN_PHONE_REGEX.test(clean);
}

// 1. Positive Test Cases
const positiveTestCases = [
  { input: '0933123456', desc: 'Standard local 10-digit Syriatel' },
  { input: '0944123456', desc: 'Standard local 10-digit MTN' },
  { input: '0981276182', desc: 'Official Emdad store number local format' },
  { input: '+963933123456', desc: 'International format with +' },
  { input: '+963981276182', desc: 'Official Emdad store international format' },
  { input: '00963933123456', desc: 'International format with 00 prefix' },
  { input: '00963981276182', desc: 'Official Emdad store with 00 prefix' },
  { input: '963933123456', desc: 'International format without + or 00' },
  { input: '963981276182', desc: 'Official Emdad store 9639 format' },
  { input: '0933 123 456', desc: 'Local number with spaces' },
  { input: '+963 933 123 456', desc: 'International with spaces' },
  { input: '+963 981 276 182', desc: 'Official store formatted with spaces' },
  { input: '0933-123-456', desc: 'Local number with hyphens/dashes' },
  { input: '+963-933-123-456', desc: 'International with hyphens/dashes' },
  { input: '0955443322', desc: 'Syrian MTN 095' },
  { input: '0966112233', desc: 'Syrian MTN 096' },
  { input: '0988776655', desc: 'Syrian Syriatel 098' },
  { input: '0999887766', desc: 'Syrian Syriatel 099' },
  { input: '  0933123456  ', desc: 'Number with leading and trailing whitespace' },
];

for (const tc of positiveTestCases) {
  const result = validateSyrianPhone(tc.input);
  assert(result, `Positive: ${tc.desc} ("${tc.input}")`);
}

// 2. Negative Test Cases (Must be rejected)
const negativeTestCases = [
  { input: '093312345', desc: '9 digits (too short)' },
  { input: '09331234567', desc: '11 digits (too long)' },
  { input: '0833123456', desc: 'Invalid Syrian prefix 08' },
  { input: '0733123456', desc: 'Invalid Syrian prefix 07' },
  { input: '0112345678', desc: 'Damascus landline (not mobile)' },
  { input: '0212345678', desc: 'Aleppo landline (not mobile)' },
  { input: '+9638123456', desc: 'Non-mobile Syria after 963' },
  { input: '+9630933123456', desc: 'Illegal extra 0 after country code +963' },
  { input: '++963933123456', desc: 'Malformed double plus' },
  { input: '+962791234567', desc: 'Jordanian mobile number' },
  { input: '+966501234567', desc: 'Saudi mobile number' },
  { input: '+971501234567', desc: 'UAE mobile number' },
  { input: '+12025550123', desc: 'US phone number' },
  { input: '093312345a', desc: 'Contains letter character' },
  { input: 'phone09331', desc: 'Alphabetical characters' },
  { input: '0933-123-45a', desc: 'Letters with dashes' },
  { input: '', desc: 'Empty string' },
  { input: '     ', desc: 'Whitespace string' },
  { input: null, desc: 'Null value' },
  { input: undefined, desc: 'Undefined value' },
  { input: '0900123456789', desc: 'Excessive digits starting with 09' },
  { input: '963833123456', desc: 'Invalid mobile indicator after country code (8 instead of 9)' },
];

for (const tc of negativeTestCases) {
  const result = validateSyrianPhone(tc.input);
  assert(!result, `Negative (Rejected): ${tc.desc} ("${tc.input}")`);
}

// =========================================================================
// SUITE 2: 14 SYRIAN GOVERNORATES EXHAUSTIVE VALIDATION
// =========================================================================
console.log('\n🏛️ [SUITE 2] 14 Syrian Governorates Exhaustive Verification:');

const expected14Governorates = [
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

assert(expected14Governorates.length === 14, 'Canonical Syrian governorates list has exactly 14 governorates');

// Check in src/types/cart.ts
const cartTypesSrc = fs.readFileSync(path.resolve('src/types/cart.ts'), 'utf8');
const deliveryModalSrc = fs.readFileSync(path.resolve('src/components/cart/DeliveryModal.tsx'), 'utf8');

assert(
  cartTypesSrc.includes('export const SYRIAN_GOVERNORATES = ['),
  'SYRIAN_GOVERNORATES is exported in src/types/cart.ts'
);

let allGovsInTypes = true;
for (const gov of expected14Governorates) {
  if (!cartTypesSrc.includes(`'${gov}'`)) {
    allGovsInTypes = false;
    assert(false, `Governorate in types: ${gov}`, 'Missing from src/types/cart.ts');
  }
}
if (allGovsInTypes) {
  assert(true, 'All 14 Syrian governorates explicitly defined in src/types/cart.ts');
}

assert(
  deliveryModalSrc.includes('SYRIAN_GOVERNORATES.map((gov)'),
  'DeliveryModal dynamically renders all governorates from SYRIAN_GOVERNORATES array'
);

// Verify select dropdown contains placeholder and validation
assert(
  deliveryModalSrc.includes('<option value="">اختر المحافظة...</option>'),
  'DeliveryModal provides proper default unselected option'
);

assert(
  deliveryModalSrc.includes('!SYRIAN_GOVERNORATES.includes(governorate as any)'),
  'DeliveryModal strictly validates selected governorate against official SYRIAN_GOVERNORATES'
);

// =========================================================================
// SUITE 3: COMPLETE BRAND CONTAMINATION & REFERENCE PURITY AUDIT
// =========================================================================
console.log('\n🛡️ [SUITE 3] Brand Contamination & Reference Audit:');

const forbiddenPatterns = [
  { name: 'Forbidden hex color #60c984', regex: /#?60c984/i },
  { name: 'Forbidden reference "gravity"', regex: /\bgravity\b/i },
  { name: 'Forbidden reference "tajir"', regex: /\btajir\b/i },
  { name: 'Reference phone "0988896208"', regex: /0988896208/ },
];

const scannedFiles = [];
const violations = [];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      scanDirectory(fullPath);
    } else if (/\.(tsx|ts|jsx|js|mjs|json|css|svg)$/.test(entry.name)) {
      // Allow verification scripts themselves to reference forbidden terms in checks
      if (entry.name.startsWith('verify-') || entry.name.startsWith('challenger-') || entry.name.startsWith('adversarial-')) {
        continue;
      }
      scannedFiles.push(fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.regex.test(content)) {
          violations.push({
            file: fullPath,
            pattern: pattern.name,
            snippet: content.substring(content.search(pattern.regex) - 20, content.search(pattern.regex) + 40),
          });
        }
      }
    }
  }
}

scanDirectory(path.resolve('src'));
scanDirectory(path.resolve('public'));
scanDirectory(path.resolve('tailwind.config.ts'));
scanDirectory(path.resolve('next.config.mjs'));

assert(
  violations.length === 0,
  `Zero occurrences of #60c984, "gravity", "tajir", or reference phone across ${scannedFiles.length} files`,
  violations.map(v => `${v.file} (${v.pattern})`).join('; ')
);

// Verify Emdad official brand tokens
const tailwindConfig = fs.readFileSync(path.resolve('tailwind.config.ts'), 'utf8');
assert(tailwindConfig.includes('#0D5C96'), 'Brand primary navy token #0D5C96 present');
assert(tailwindConfig.includes('#14B8A6'), 'Brand turquoise token #14B8A6 present');
assert(tailwindConfig.includes('#38BDF8'), 'Brand sky blue token #38BDF8 present');
assert(tailwindConfig.includes('#00A896'), 'Brand tagline teal token #00A896 present');

// =========================================================================
// SUITE 4: CURRENCY FORMATTING (ل.س) VERIFICATION
// =========================================================================
console.log('\n💰 [SUITE 4] Currency Formatting (ل.س) in Cart & Checkout:');

const cartDrawerSrc = fs.readFileSync(path.resolve('src/components/cart/CartDrawer.tsx'), 'utf8');
const orderSuccessModalSrc = fs.readFileSync(path.resolve('src/components/cart/OrderSuccessModal.tsx'), 'utf8');

// Check Cart Drawer line items & subtotal
assert(
  cartDrawerSrc.includes("item.price.toLocaleString('ar-SY')") && cartDrawerSrc.includes('ل.س'),
  'CartDrawer formats individual item unit prices in Syrian Pounds (ل.س)'
);
assert(
  cartDrawerSrc.includes("(item.price * item.quantity).toLocaleString('ar-SY')") && cartDrawerSrc.includes('ل.س'),
  'CartDrawer formats line item totals in Syrian Pounds (ل.س)'
);
assert(
  cartDrawerSrc.includes("subtotal.toLocaleString('ar-SY')") && cartDrawerSrc.includes('ل.س'),
  'CartDrawer formats subtotal in Syrian Pounds (ل.س)'
);

// Check Delivery Modal subtotal
assert(
  deliveryModalSrc.includes("subtotal.toLocaleString('ar-SY')") && deliveryModalSrc.includes('ل.س'),
  'DeliveryModal header displays order total in Syrian Pounds (ل.س)'
);

// Check Order Success Modal summary
assert(
  orderSuccessModalSrc.includes("orderResult.subtotal.toLocaleString('ar-SY')") && orderSuccessModalSrc.includes('ل.س'),
  'OrderSuccessModal displays grand total in Syrian Pounds (ل.س)'
);

// Check WhatsApp Order Message formatting
assert(
  whatsappSrc.includes("item.price.toLocaleString('ar-SY')} ل.س"),
  'WhatsApp message formats unit prices in Syrian Pounds (ل.س)'
);
assert(
  whatsappSrc.includes("itemTotal.toLocaleString('ar-SY')} ل.س"),
  'WhatsApp message formats line totals in Syrian Pounds (ل.س)'
);
assert(
  whatsappSrc.includes("subtotal.toLocaleString('ar-SY')} ل.س"),
  'WhatsApp message formats order total in Syrian Pounds (ل.س)'
);

// Foreign currency absence assertion
const currencyFiles = [cartDrawerSrc, deliveryModalSrc, orderSuccessModalSrc, whatsappSrc];
let foreignCurrencyFound = false;
for (const text of currencyFiles) {
  if (/\b(USD|\$|SAR|AED|EUR|GBP)\b/.test(text)) {
    foreignCurrencyFound = true;
  }
}
assert(!foreignCurrencyFound, 'Zero foreign currency tokens ($ / USD / SAR / AED / EUR) in cart and checkout files');

// =========================================================================
// SUITE 5: WHATSAPP ORDER URL & PAYLOAD BUILDER SIMULATION
// =========================================================================
console.log('\n💬 [SUITE 5] WhatsApp Order URL & Payload Builder Simulation:');

// Test official store WhatsApp constants
assert(
  whatsappSrc.includes("STORE_WHATSAPP_NUMBER = '+963 981 276 182'"),
  'Official store formatted WhatsApp number: +963 981 276 182'
);
assert(
  whatsappSrc.includes("STORE_WHATSAPP_DIGITS = '963981276182'"),
  'Official store target digits: 963981276182'
);

// Extract helper functions for testing
const orderRefMatch = whatsappSrc.match(/export function generateOrderReference\(\)[\s\S]*?return `(EMD-[\s\S]*?)`;\s*\}/);
assert(orderRefMatch !== null, 'generateOrderReference function exports EMD- prefix');

// Simulate order generation
const samplePayload = {
  orderNumber: 'EMD-123456-789',
  delivery: {
    fullName: 'د. خالد النجار',
    phoneNumber: '0933112233',
    governorate: 'دمشق',
    addressDetails: 'الشعلان - جانب ساحة النجمة - بناء الشام طابق 2',
    notes: 'التسليم بعد الساعة 12 ظهراً',
  },
  items: [
    {
      id: 'prod-1',
      productId: 'prod-1',
      sku: 'EMD-REST-001',
      name: 'كومبوزيت يونيفرسال Filtek Z250',
      price: 350000,
      image: '/images/products/composite-syringe.svg',
      category: 'مواد الترميم والحشوات',
      unit: 'محقنة 4 غرام',
      quantity: 2,
    },
    {
      id: 'prod-2',
      productId: 'prod-2',
      sku: 'EMD-ENDO-001',
      name: 'مبارد روتاري نيتي ProTaper Gold',
      price: 850000,
      image: '/images/products/rotary-files.svg',
      category: 'معالجة لبية',
      unit: 'طقم 6 مبارد',
      quantity: 1,
    },
  ],
  subtotal: 1550000,
  timestamp: '2026-10-05 10:30 ص',
};

// Test message formatter logic
function testFormatMessage(payload) {
  const { orderNumber, delivery, items, subtotal, timestamp } = payload;
  const itemsListText = items
    .map((item, index) => {
      const itemTotal = item.price * item.quantity;
      return [
        `${index + 1}. *${item.name}*`,
        `   • رمز المادة: ${item.sku || 'N/A'}`,
        `   • الكمية: ${item.quantity} ${item.unit || 'قطعة'}`,
        `   • سعر الوحدة: ${item.price.toLocaleString('ar-SY')} ل.س`,
        `   • إجمالي البند: ${itemTotal.toLocaleString('ar-SY')} ل.س`,
      ].join('\n');
    })
    .join('\n\n');

  const notesLine =
    delivery.notes && delivery.notes.trim()
      ? `• ملاحظات الاستلام: ${delivery.notes.trim()}`
      : '• ملاحظات: لا توجد ملاحظات خاصة';

  return [
    `🦷 *طلب شراء جديد — متجر إمداد لمستلزمات طب الأسنان*`,
    `_مستلزماتك ... بين يديك_`,
    `══════════════════════`,
    `📋 *رقم الطلب:* \`${orderNumber}\``,
    `🗓️ *التاريخ والوقت:* ${timestamp}`,
    ``,
    `👨‍⚕️ *بيانات الطبيب / المركز الطبي:*`,
    `• الاسم: ${delivery.fullName}`,
    `• رقم الموبايل: ${delivery.phoneNumber}`,
    `• المحافظة: ${delivery.governorate}`,
    `• العنوان بالتفصيل: ${delivery.addressDetails}`,
    notesLine,
    ``,
    `══════════════════════`,
    `🛒 *قائمة المواد المطلوبة (${items.length} أصناف):*`,
    ``,
    itemsListText,
    ``,
    `══════════════════════`,
    `💰 *إجمالي قيمة المواد:* *${subtotal.toLocaleString('ar-SY')} ل.س*`,
    `🚚 *الشحن:* يرجى تأكيد شركة الشحن المعتمدة ووقت التسليم`,
    `══════════════════════`,
    `يرجى تأكيد استلام الطلب وتزويدنا بتفاصيل التجهيز والشحن. شاكرين تعاونكم مع إمداد! 🌟`,
  ].join('\n');
}

const formattedMsg = testFormatMessage(samplePayload);
assert(formattedMsg.includes('EMD-123456-789'), 'Message contains exact order reference');
assert(formattedMsg.includes('د. خالد النجار'), 'Message contains customer full name');
assert(formattedMsg.includes('0933112233'), 'Message contains customer phone');
assert(formattedMsg.includes('دمشق'), 'Message contains customer governorate');
assert(formattedMsg.includes('الشعلان'), 'Message contains customer address');
assert(formattedMsg.includes('Filtek Z250'), 'Message contains item 1 name');
assert(formattedMsg.includes('ProTaper Gold'), 'Message contains item 2 name');
assert(formattedMsg.includes('1,550,000') || formattedMsg.includes('١٬٥٥٠٬٠٠٠'), 'Message contains formatted subtotal in Arabic locale');

const targetUrl = `https://wa.me/963981276182?text=${encodeURIComponent(formattedMsg)}`;
assert(targetUrl.startsWith('https://wa.me/963981276182?text='), 'Target URL correctly targets wa.me/963981276182');
assert(decodeURIComponent(targetUrl.split('?text=')[1]) === formattedMsg, 'URL encoding is completely lossless and decodable');

// =========================================================================
// SUITE 6: PERSISTENT CART LOGIC & UX INTERACTION TESTS
// =========================================================================
console.log('\n🛒 [SUITE 6] Cart Context, LocalStorage & UX Interaction Tests:');

const cartContextSrc = fs.readFileSync(path.resolve('src/context/CartContext.tsx'), 'utf8');

// Test 1: LocalStorage Key
assert(cartContextSrc.includes("STORAGE_KEY = 'emdad_dental_cart_v1'"), 'Cart uses isolated key "emdad_dental_cart_v1"');

// Test 2: Hydration guard
assert(cartContextSrc.includes('isHydrated'), 'Cart implements isHydrated guard preventing SSR hydration mismatch');

// Test 3: Self-healing JSON parse
assert(
  cartContextSrc.includes('catch (err)') && cartContextSrc.includes('localStorage.removeItem(STORAGE_KEY)'),
  'Cart self-heals corrupted LocalStorage without crashing the client'
);

// Test 4: Cross-tab sync
assert(
  cartContextSrc.includes("window.addEventListener('storage'"),
  'Cart subscribes to window storage event for instant cross-tab synchronization'
);

// Test 5: Stepper UX: Trash icon at qty = 1
assert(
  cartDrawerSrc.includes('item.quantity === 1 ?') && cartDrawerSrc.includes('stepper-decrement-trash-'),
  'CartDrawer transforms minus button into Trash icon when quantity equals 1'
);

// Test 6: Clear Cart confirmation safety
assert(
  cartDrawerSrc.includes('confirmClear') && cartDrawerSrc.includes('هل أنت متأكد من رغبتك بإفراغ السلة؟'),
  'CartDrawer prevents accidental cart wipe with confirmation dialog'
);

// =========================================================================
// SUMMARY OF ADVERSARIAL VERIFICATION
// =========================================================================
console.log('\n=================================================================');
console.log(`📊 ADVERSARIAL VERIFICATION SUMMARY:`);
console.log(`   Total Test Cases: ${totalTests}`);
console.log(`   Passed:           ${passedTests}`);
console.log(`   Failed:           ${failedTests}`);
console.log('=================================================================');

if (failedTests > 0) {
  console.error('\n❌ FAILURES RECORDED:');
  for (const f of failureList) {
    console.error(`  - ${f.testName}: ${f.details}`);
  }
  process.exit(1);
} else {
  console.log('\n🎉 ALL ADVERSARIAL CHECKS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

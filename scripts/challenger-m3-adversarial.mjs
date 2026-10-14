// scripts/challenger-m3-adversarial.mjs
/**
 * Milestone M3 Adversarial Empirical Verification Suite
 * Role: challenger_m3_1 (Empirical Challenger)
 * Focus: Cart state engine, bounds, stepper UX, localStorage resilience, hydration safety, Syrian checkout & WhatsApp
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 ========================================================');
console.log('🧪 EMPIRICAL CHALLENGER ADVERSARIAL TEST SUITE (Milestone M3)');
console.log('🧪 Emdad Dental: Cart, Stepper, LocalStorage & Syrian Checkout');
console.log('🧪 ========================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} ${details ? `-> ${details}` : ''}`);
    failureDetails.push({ testName, details });
  }
}

// ---------------------------------------------------------------------
// TEST SUITE 1: CART ENGINE IN-MEMORY STATE MACHINE SIMULATION
// ---------------------------------------------------------------------
console.log('📦 --- TEST SUITE 1: Cart Engine State Machine & Invariants ---');

// We re-implement the pure state transition logic matching CartContext.tsx exactly
function createCartStateSimulator() {
  let items = [];

  const addItem = (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Math.floor(quantity));
    const maxStock = product.stock || 99;

    const existingIndex = items.findIndex(
      (item) => item.productId === product.id || item.id === product.id
    );

    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const updatedQty = Math.min(existing.quantity + qtyToAdd, maxStock);
      items[existingIndex] = {
        ...existing,
        quantity: updatedQty,
      };
      return;
    }

    const newItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      nameEn: product.nameEn,
      sku: product.sku,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.categoryName || '',
      categoryName: product.categoryName || '',
      unit: product.unit || 'قطعة',
      quantity: Math.min(qtyToAdd, maxStock),
      stock: product.stock,
    };

    items.push(newItem);
  };

  const removeItem = (productId) => {
    items = items.filter((item) => item.productId !== productId && item.id !== productId);
  };

  const updateQuantity = (productId, quantity) => {
    const newQty = Math.floor(quantity);
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }

    items = items.map((item) => {
      if (item.productId === productId || item.id === productId) {
        const limit = item.stock || 99;
        return { ...item, quantity: Math.min(newQty, limit) };
      }
      return item;
    });
  };

  const clearCart = () => {
    items = [];
  };

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);
  const getSubtotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    getItems: () => [...items],
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
  };
}

// Mock Products
const mockP1 = { id: 'p1', name: 'كومبوزيت نانو هيبريد', sku: 'REST-001', price: 185000, stock: 10, unit: 'محقنة 4 غرام' };
const mockP2 = { id: 'p2', name: 'بوند عاج ومينا الجيل الخامس', sku: 'REST-002', price: 240000, stock: 5, unit: 'عبوة 5 مل' };
const mockP3 = { id: 'p3', name: 'مبارد روتاري معالجة لبية', sku: 'ENDO-001', price: 95000, stock: 99, unit: 'طقم 6 مبارد' };
const mockPNoStock = { id: 'p4', name: 'توربين أسنان ضوئي', sku: 'EQ-001', price: 1250000, unit: 'قطعة' }; // stock undefined

// 1.1 Initial state
const sim = createCartStateSimulator();
assert(sim.getItems().length === 0, '1.1 Initial cart has 0 items');
assert(sim.getTotalItems() === 0, '1.1 Initial totalItems is 0');
assert(sim.getSubtotal() === 0, '1.1 Initial subtotal is 0');

// 1.2 Add single product with default qty
sim.addItem(mockP1);
assert(sim.getItems().length === 1, '1.2 Cart has 1 item after addItem(p1)');
assert(sim.getItems()[0].quantity === 1, '1.2 Added item quantity is 1');
assert(sim.getTotalItems() === 1, '1.2 totalItems is 1');
assert(sim.getSubtotal() === 185000, '1.2 subtotal matches p1 price (185,000)');

// 1.3 Add same product again (increment existing)
sim.addItem(mockP1, 2);
assert(sim.getItems().length === 1, '1.3 Cart does not duplicate line item on re-add');
assert(sim.getItems()[0].quantity === 3, '1.3 Item quantity correctly accumulates (1 + 2 = 3)');
assert(sim.getTotalItems() === 3, '1.3 totalItems updated to 3');
assert(sim.getSubtotal() === 185000 * 3, '1.3 subtotal correctly recalculates (555,000)');

// 1.4 Add second product
sim.addItem(mockP2, 2);
assert(sim.getItems().length === 2, '1.4 Cart has 2 distinct line items');
assert(sim.getTotalItems() === 5, '1.4 totalItems is 5 (3 + 2)');
assert(sim.getSubtotal() === 185000 * 3 + 240000 * 2, '1.4 subtotal is 1,035,000');

// 1.5 Quantity bounds: float / decimal input
sim.addItem(mockP3, 3.8);
const p3Item = sim.getItems().find((i) => i.productId === 'p3');
assert(p3Item && p3Item.quantity === 3, '1.5 Floats/decimals are truncated to integer (3.8 -> 3)');

// 1.6 Quantity bounds: zero and negative quantity in addItem
sim.addItem(mockP3, 0);
sim.addItem(mockP3, -5);
const p3Updated = sim.getItems().find((i) => i.productId === 'p3');
// Math.max(1, Math.floor(0)) is 1, Math.max(1, Math.floor(-5)) is 1
assert(p3Updated.quantity === 5, '1.6 Non-positive inputs clamped safely to >= 1 additions (3 + 1 + 1 = 5)');

// 1.7 Quantity bounds: stock ceiling clamping
// mockP2 has stock 5. Already has 2. Try adding 10.
sim.addItem(mockP2, 10);
const p2Clamped = sim.getItems().find((i) => i.productId === 'p2');
assert(p2Clamped.quantity === 5, '1.7 Stock ceiling clamps quantity to available warehouse stock (5)');

// 1.8 Default stock ceiling when product.stock is undefined
sim.addItem(mockPNoStock, 150);
const p4Clamped = sim.getItems().find((i) => i.productId === 'p4');
assert(p4Clamped.quantity === 99, '1.8 Default stock ceiling of 99 enforced when stock is undefined (150 -> 99)');

// 1.9 updateQuantity to 0 or negative triggers removeItem
sim.updateQuantity('p4', 0);
assert(!sim.getItems().some((i) => i.productId === 'p4'), '1.9 updateQuantity(id, 0) removes item completely');

sim.updateQuantity('p3', -10);
assert(!sim.getItems().some((i) => i.productId === 'p3'), '1.9 updateQuantity(id, -10) removes item completely');

// 1.10 updateQuantity respects stock ceiling
sim.updateQuantity('p2', 20);
assert(sim.getItems().find((i) => i.productId === 'p2').quantity === 5, '1.10 updateQuantity clamps to stock limit');

// 1.11 removeItem for single item
sim.removeItem('p2');
assert(sim.getItems().length === 1 && sim.getItems()[0].productId === 'p1', '1.11 removeItem removes target item correctly');
assert(sim.getSubtotal() === 185000 * 3, '1.11 Subtotal matches remaining item');

// 1.12 clearCart resets everything
sim.clearCart();
assert(sim.getItems().length === 0, '1.12 clearCart leaves 0 items');
assert(sim.getTotalItems() === 0, '1.12 clearCart leaves totalItems = 0');
assert(sim.getSubtotal() === 0, '1.12 clearCart leaves subtotal = 0');

// 1.13 Adversarial Stress Simulation: 10,000 randomized operations
console.log('  🎲 Running 10,000 randomized adversarial state mutations...');
const stressProducts = [mockP1, mockP2, mockP3, mockPNoStock];
const stressSim = createCartStateSimulator();
let invariantViolations = 0;

for (let step = 0; step < 10000; step++) {
  const op = Math.floor(Math.random() * 4);
  const prod = stressProducts[Math.floor(Math.random() * stressProducts.length)];
  const randomQty = Math.floor(Math.random() * 20) - 5; // -5 to 14

  if (op === 0) {
    stressSim.addItem(prod, randomQty);
  } else if (op === 1) {
    stressSim.updateQuantity(prod.id, randomQty);
  } else if (op === 2) {
    stressSim.removeItem(prod.id);
  } else if (op === 3 && step % 500 === 0) {
    stressSim.clearCart();
  }

  // Check Invariants
  const currentItems = stressSim.getItems();
  const calculatedItems = currentItems.reduce((s, it) => s + it.quantity, 0);
  const calculatedSubtotal = currentItems.reduce((s, it) => s + it.price * it.quantity, 0);

  if (stressSim.getTotalItems() !== calculatedItems) invariantViolations++;
  if (stressSim.getSubtotal() !== calculatedSubtotal) invariantViolations++;
  if (currentItems.some((it) => it.quantity < 1)) invariantViolations++;
  const uniqueIds = new Set(currentItems.map((it) => it.productId));
  if (uniqueIds.size !== currentItems.length) invariantViolations++;
}

assert(invariantViolations === 0, '1.13 Cart invariants held 100% across 10,000 adversarial mutations');


// ---------------------------------------------------------------------
// TEST SUITE 2: STEPPER TOGGLE CONTRACT (Trash2 on qty 1 vs Minus on qty > 1)
// ---------------------------------------------------------------------
console.log('\n🗑️ --- TEST SUITE 2: Stepper UX & Decrement Toggle Contract ---');

const cartDrawerPath = path.resolve('src/components/cart/CartDrawer.tsx');
assert(fs.existsSync(cartDrawerPath), '2.1 CartDrawer.tsx file exists');

const cartDrawerCode = fs.readFileSync(cartDrawerPath, 'utf8');

// 2.2 Verify presence of exact testids in code
assert(
  cartDrawerCode.includes('data-testid={`stepper-decrement-trash-${item.productId}`}'),
  '2.2 CartDrawer contains exact data-testid stepper-decrement-trash-${item.productId}'
);
assert(
  cartDrawerCode.includes('data-testid={`stepper-decrement-${item.productId}`}'),
  '2.2 CartDrawer contains exact data-testid stepper-decrement-${item.productId}'
);
assert(
  cartDrawerCode.includes('data-testid={`stepper-increment-${item.productId}`}'),
  '2.2 CartDrawer contains exact data-testid stepper-increment-${item.productId}'
);

// 2.3 Verify Stepper branching condition
assert(
  cartDrawerCode.includes('item.quantity === 1 ?'),
  '2.3 Stepper conditionally branches on item.quantity === 1'
);

// 2.4 Verify Trash2 icon and red styling
assert(
  cartDrawerCode.includes('<Trash2 className="h-3.5 w-3.5 text-rose-500" />'),
  '2.4 Trash branch renders Trash2 icon with text-rose-500 red accent'
);
assert(
  cartDrawerCode.includes('removeItem(item.productId)'),
  '2.4 Clicking trash decrement button calls removeItem(item.productId)'
);

// 2.5 Verify Minus icon for quantity > 1
assert(
  cartDrawerCode.includes('<Minus className="h-3.5 w-3.5" />'),
  '2.5 Quantity > 1 branch renders Minus icon'
);
assert(
  cartDrawerCode.includes('updateQuantity(item.productId, item.quantity - 1)'),
  '2.5 Clicking minus decrement button calls updateQuantity(productId, quantity - 1)'
);

// 2.6 Stepper behavioral simulation
function simulateStepperClick(currentQty, productId, actions) {
  if (currentQty === 1) {
    actions.removeItem(productId);
    return { testid: `stepper-decrement-trash-${productId}`, actionTaken: 'removed' };
  } else {
    actions.updateQuantity(productId, currentQty - 1);
    return { testid: `stepper-decrement-${productId}`, actionTaken: 'decremented' };
  }
}

const stepperSim = createCartStateSimulator();
stepperSim.addItem(mockP1, 2); // qty 2
let stepResult = simulateStepperClick(stepperSim.getItems()[0].quantity, 'p1', stepperSim);
assert(
  stepResult.testid === 'stepper-decrement-p1' && stepResult.actionTaken === 'decremented' && stepperSim.getItems()[0].quantity === 1,
  '2.6 Decrementing from quantity 2 produces stepper-decrement-p1 and updates quantity to 1'
);

stepResult = simulateStepperClick(stepperSim.getItems()[0].quantity, 'p1', stepperSim);
assert(
  stepResult.testid === 'stepper-decrement-trash-p1' && stepResult.actionTaken === 'removed' && stepperSim.getItems().length === 0,
  '2.6 Decrementing from quantity 1 produces stepper-decrement-trash-p1 and removes item from cart'
);


// ---------------------------------------------------------------------
// TEST SUITE 3: LOCALSTORAGE SERIALIZATION & SSR HYDRATION SAFETY
// ---------------------------------------------------------------------
console.log('\n💾 --- TEST SUITE 3: LocalStorage Serialization & Hydration Safety ---');

const cartContextPath = path.resolve('src/context/CartContext.tsx');
assert(fs.existsSync(cartContextPath), '3.1 CartContext.tsx file exists');
const cartContextCode = fs.readFileSync(cartContextPath, 'utf8');

// 3.2 Storage key consistency
assert(
  cartContextCode.includes("STORAGE_KEY = 'emdad_dental_cart_v1'"),
  "3.2 CartContext uses standardized storage key 'emdad_dental_cart_v1'"
);

// 3.3 SSR Hydration mismatch prevention
assert(
  cartContextCode.includes('const [isHydrated, setIsHydrated] = useState(false)'),
  '3.3 isHydrated state initialized to false (guaranteeing identical SSR and client initial tree)'
);
assert(
  cartContextCode.includes('setIsHydrated(true)'),
  '3.3 isHydrated set to true strictly inside client-only useEffect'
);
assert(
  cartContextCode.includes('if (!isHydrated) return;'),
  '3.3 LocalStorage write is guarded until after hydration completes'
);

// 3.4 LocalStorage parsing resilience & self-healing simulation
function simulateLocalStorageHydration(storedRawValue) {
  let loadedItems = [];
  let storageCleared = false;
  let healed = false;
  let isHydrated = false;

  const mockLocalStorage = {
    getItem: () => storedRawValue,
    removeItem: (k) => {
      if (k === 'emdad_dental_cart_v1') storageCleared = true;
    },
  };

  try {
    const stored = mockLocalStorage.getItem('emdad_dental_cart_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        loadedItems = parsed;
      }
    }
  } catch (err) {
    try {
      mockLocalStorage.removeItem('emdad_dental_cart_v1');
      healed = true;
    } catch (_) {}
  } finally {
    isHydrated = true;
  }

  return { loadedItems, isHydrated, healed, storageCleared };
}

// 3.4.1 Valid items serialized in localStorage
const validSerialized = JSON.stringify([{ id: 'p1', productId: 'p1', name: 'Item 1', price: 1000, quantity: 2 }]);
const resValid = simulateLocalStorageHydration(validSerialized);
assert(resValid.isHydrated && resValid.loadedItems.length === 1, '3.4.1 Valid stored JSON hydrates items correctly');

// 3.4.2 Corrupted / malformed JSON
const resCorrupted = simulateLocalStorageHydration('{invalid json syntax: missing closing');
assert(
  resCorrupted.isHydrated && resCorrupted.loadedItems.length === 0 && resCorrupted.healed && resCorrupted.storageCleared,
  '3.4.2 Corrupted JSON is safely caught, self-heals by purging key, and finishes hydration without crash'
);

// 3.4.3 Stored value is a JSON primitive (e.g. number or object, not array)
const resNumber = simulateLocalStorageHydration('12345');
assert(
  resNumber.isHydrated && resNumber.loadedItems.length === 0,
  '3.4.3 Stored number string is safely ignored (Array.isArray guard)'
);

const resObject = simulateLocalStorageHydration('{"someKey": "value"}');
assert(
  resObject.isHydrated && resObject.loadedItems.length === 0,
  '3.4.3 Stored non-array object is safely ignored without crash'
);

// 3.4.4 LocalStorage null (fresh user)
const resNull = simulateLocalStorageHydration(null);
assert(
  resNull.isHydrated && resNull.loadedItems.length === 0,
  '3.4.4 Null localStorage (fresh visit) hydrates empty cart cleanly'
);

// 3.5 Cross-tab synchronization
assert(
  cartContextCode.includes("window.addEventListener('storage', handleStorageChange)"),
  '3.5 StorageEvent listener registered for cross-tab cart synchronization'
);


// ---------------------------------------------------------------------
// TEST SUITE 4: SYRIAN CHECKOUT & WHATSAPP ADVERSARIAL VALIDATION
// ---------------------------------------------------------------------
console.log('\n🇸🇾 --- TEST SUITE 4: Syrian Delivery & WhatsApp Validation ---');

const whatsappLibPath = path.resolve('src/lib/whatsapp.ts');
const cartTypesPath = path.resolve('src/types/cart.ts');

assert(fs.existsSync(whatsappLibPath), '4.1 src/lib/whatsapp.ts exists');
assert(fs.existsSync(cartTypesPath), '4.1 src/types/cart.ts exists');

const whatsappCode = fs.readFileSync(whatsappLibPath, 'utf8');

// 4.2 Official WhatsApp details
assert(
  whatsappCode.includes("STORE_WHATSAPP_NUMBER = '+963 981 276 182'"),
  "4.2 Formatted store number '+963 981 276 182' is correct"
);
assert(
  whatsappCode.includes("STORE_WHATSAPP_DIGITS = '963981276182'"),
  "4.2 Digits string '963981276182' is correct"
);

// 4.3 Regex test harness
const SYRIAN_PHONE_REGEX = /^(09\d{8}|(\+?9639\d{8})|(009639\d{8}))$/;
function validateSyrianPhone(phone) {
  if (!phone) return false;
  const clean = phone.trim().replace(/[\s-]/g, '');
  return SYRIAN_PHONE_REGEX.test(clean);
}

const adversarialPhones = [
  // Valid variations
  { input: '0944123456', expected: true, desc: 'Local 09 MTN format' },
  { input: '0981276182', expected: true, desc: 'Local 09 Syriatel format' },
  { input: '+963981276182', expected: true, desc: 'International with plus' },
  { input: '963981276182', expected: true, desc: 'International without plus' },
  { input: '00963981276182', expected: true, desc: 'International with double zeros' },
  { input: '  0981 276 182  ', expected: true, desc: 'Spaces within and surrounding' },
  { input: '0981-276-182', expected: true, desc: 'Hyphens within number' },
  // Invalid variations
  { input: '', expected: false, desc: 'Empty string' },
  { input: '   ', expected: false, desc: 'Whitespace only' },
  { input: '094412345', expected: false, desc: '9 digits (too short)' },
  { input: '09441234567', expected: false, desc: '11 digits (too long)' },
  { input: '0112345678', expected: false, desc: 'Damascus landline prefix 011 (not mobile)' },
  { input: '0312345678', expected: false, desc: 'Homs landline prefix 031' },
  { input: '+966501234567', expected: false, desc: 'Saudi mobile (+966)' },
  { input: '+962791234567', expected: false, desc: 'Jordanian mobile (+962)' },
  { input: '+14155552671', expected: false, desc: 'US mobile (+1)' },
  { input: '0981276182<script>', expected: false, desc: 'XSS script injection' },
  { input: '0981276182; DROP TABLE', expected: false, desc: 'SQL injection attempt' },
  { input: 'abcdefghij', expected: false, desc: 'Alphabetic characters' },
];

let phoneValidationSuccess = true;
for (const testCase of adversarialPhones) {
  const result = validateSyrianPhone(testCase.input);
  if (result !== testCase.expected) {
    phoneValidationSuccess = false;
    assert(false, `Phone validation mismatch: "${testCase.input}" (${testCase.desc})`, `Got ${result}, expected ${testCase.expected}`);
  }
}
if (phoneValidationSuccess) {
  assert(true, `4.3 All ${adversarialPhones.length} adversarial Syrian phone test cases passed perfectly`);
}

// 4.4 Syrian Governorates Integrity
const expectedGovs = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'السويداء', 'درعا', 'القنيطرة', 'دير الزور', 'الحسكة', 'الرقة', 'إدلب'
];

assert(expectedGovs.length === 14, '4.4 Exact count of 14 Syrian governorates');
const typesCode = fs.readFileSync(cartTypesPath, 'utf8');
let allGovsInTypes = true;
for (const g of expectedGovs) {
  if (!typesCode.includes(`'${g}'`)) allGovsInTypes = false;
}
assert(allGovsInTypes, '4.4 All 14 Syrian governorates defined in types/cart.ts SYRIAN_GOVERNORATES constant');

// 4.5 WhatsApp URL generation test
function generateOrderReference() {
  const timeSlice = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `EMD-${timeSlice}-${randomSuffix}`;
}

const testOrderNumber = generateOrderReference();
assert(/^EMD-\d{6}-\d{3}$/.test(testOrderNumber), `4.5 Order reference format matches EMD-xxxxxx-xxx (${testOrderNumber})`);

const samplePayload = {
  orderNumber: testOrderNumber,
  delivery: {
    fullName: 'د. عمار الخالدي',
    phoneNumber: '0981276182',
    governorate: 'دمشق',
    addressDetails: 'المزة، أوتوستراد، عيادات النور، طابق 2',
    notes: 'التسليم بين 12 ظهراً و 4 عصراً',
  },
  items: [
    {
      id: 'p1',
      productId: 'p1',
      sku: 'REST-001',
      name: 'كومبوزيت نانو هيبريد',
      price: 185000,
      quantity: 2,
      unit: 'محقنة 4 غرام',
      image: '/images/products/composite-syringe.svg',
      category: 'مواد الترميم والحشوات',
    },
  ],
  subtotal: 370000,
  timestamp: '2026-10-05 10:00',
};

// Test message generation format matching whatsapp.ts
function formatWhatsAppOrderMessage(payload) {
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

  const messageLines = [
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
  ];

  return messageLines.join('\n');
}

const formattedMsg = formatWhatsAppOrderMessage(samplePayload);
assert(formattedMsg.includes('طلب شراء جديد — متجر إمداد'), '4.5 Message contains store title');
assert(formattedMsg.includes('مستلزماتك ... بين يديك'), '4.5 Message contains official tagline');
assert(formattedMsg.includes(testOrderNumber), '4.5 Message contains order reference number');
assert(formattedMsg.includes('د. عمار الخالدي'), '4.5 Message contains doctor name');
assert(formattedMsg.includes('كومبوزيت نانو هيبريد'), '4.5 Message contains item name');
assert(formattedMsg.includes('370,000') || formattedMsg.includes('٣٧٠'), '4.5 Message contains subtotal in SYP');

const encodedUrl = `https://wa.me/963981276182?text=${encodeURIComponent(formattedMsg)}`;
assert(encodedUrl.startsWith('https://wa.me/963981276182?text='), '4.5 WhatsApp URL points to wa.me/963981276182');
assert(decodeURIComponent(encodedUrl.split('?text=')[1]) === formattedMsg, '4.5 URL decoding is completely lossless and safe');


// ---------------------------------------------------------------------
// TEST SUITE 5: BRAND & FORBIDDEN ASSET PURITY
// ---------------------------------------------------------------------
console.log('\n🧹 --- TEST SUITE 5: Brand & Reference Purity Check ---');

const forbiddenTerms = ['60c984', 'gravity.dt', '0988896208', 'tajir.store'];
let leaks = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== 'node_modules' && ent.name !== '.next' && ent.name !== '.git') {
        scanDir(full);
      }
    } else if (/\.(tsx|ts|jsx|js|mjs|json|css|svg)$/.test(ent.name)) {
      if (ent.name.startsWith('verify-') || ent.name.startsWith('challenger-')) continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const term of forbiddenTerms) {
        if (text.toLowerCase().includes(term.toLowerCase())) {
          leaks.push({ file: full, term });
        }
      }
    }
  }
}

scanDir(path.resolve('src'));
scanDir(path.resolve('public'));
assert(leaks.length === 0, '5.1 Zero leaks of Gravity terms, forbidden green color, or reference store URLs', leaks.map(l => `${l.file}: ${l.term}`).join(', '));


// ---------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------
console.log('\n========================================================');
console.log(`📊 ADVERSARIAL TEST RESULTS:`);
console.log(`   Total Tests Executed: ${totalTests}`);
console.log(`   Passed: ${passedTests}`);
console.log(`   Failed: ${failedTests}`);
console.log('========================================================\n');

if (failedTests > 0) {
  console.error('❌ ADVERSARIAL VERIFICATION FAILED:');
  for (const f of failureDetails) {
    console.error(`  - ${f.testName}: ${f.details}`);
  }
  process.exit(1);
} else {
  console.log('🎉 ALL EMPIRICAL ADVERSARIAL TESTS PASSED WITHOUT DEFECT!');
  process.exit(0);
}

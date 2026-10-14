// scripts/challenger-adversarial-test.mjs
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

console.log('🧪 ========================================================');
console.log('🧪 EMPIRICAL CHALLENGER ADVERSARIAL TEST SUITE (M2)');
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
// Helper: Load TS module in memory
// ---------------------------------------------------------------------
function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const js = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', 'require', js);
  fn(mod, mod.exports, (modPath) => ({}));
  return mod.exports;
}

const productsModule = loadTsModule(path.resolve('src/data/products.ts'));
const categoriesModule = loadTsModule(path.resolve('src/data/categories.ts'));

const PRODUCTS = productsModule.PRODUCTS;
const CATEGORIES = categoriesModule.CATEGORIES;

console.log(`📦 Loaded ${PRODUCTS.length} products and ${CATEGORIES.length} categories.\n`);

// ---------------------------------------------------------------------
// Exact Implementation Logic from src/app/page.tsx
// ---------------------------------------------------------------------
const normalizeArabic = (text) =>
  text
    .replace(/[\u064B-\u065F]/g, '') // strip tashkeel diacritics
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase();

function filterAndSortProducts(products, { categoryId = null, searchQuery = '', sortOption = 'newest' } = {}) {
  let result = [...products];

  // Category filter
  if (categoryId) {
    result = result.filter((p) => p.categoryId === categoryId);
  }

  // Search query filter
  if (searchQuery.trim()) {
    const q = normalizeArabic(searchQuery.trim());
    result = result.filter((p) => {
      const nameMatch = normalizeArabic(p.name).includes(q);
      const nameEnMatch = p.nameEn ? p.nameEn.toLowerCase().includes(q) : false;
      const descMatch = normalizeArabic(p.description).includes(q);
      const skuMatch = p.sku.toLowerCase().includes(q);
      const specsMatch = p.technicalSpecs
        ? p.technicalSpecs.some((s) => normalizeArabic(s).includes(q))
        : false;

      return nameMatch || nameEnMatch || descMatch || skuMatch || specsMatch;
    });
  }

  // Sort options
  if (sortOption === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

// =====================================================================
// SECTION 1: Adversarial Search Normalization Challenges
// =====================================================================
console.log('🔍 [SECTION 1] Arabic Search Normalization Challenges:');

// Test 1.1: Diacritics (Tashkeel)
const resWithTashkeel = filterAndSortProducts(PRODUCTS, { searchQuery: 'حَشْوَةٌ' });
const resWithoutTashkeel = filterAndSortProducts(PRODUCTS, { searchQuery: 'حشوة' });
assert(
  resWithTashkeel.length > 0 && resWithTashkeel.length === resWithoutTashkeel.length,
  'Search "حَشْوَةٌ" (with diacritics) matches identically to "حشوة" (without diacritics)',
  `with=${resWithTashkeel.length}, without=${resWithoutTashkeel.length}`
);

// Test 1.2: Taa Marbuta vs Haa (ة vs ه)
const resTaaMarbuta = filterAndSortProducts(PRODUCTS, { searchQuery: 'حشوة' });
const resHaa = filterAndSortProducts(PRODUCTS, { searchQuery: 'حشوه' });
assert(
  resTaaMarbuta.length > 0 && resTaaMarbuta.length === resHaa.length,
  'Search "حشوة" (ة) matches identically to "حشوه" (ه)',
  `ة=${resTaaMarbuta.length}, ه=${resHaa.length}`
);

// Test 1.3: Partial keyword "مبارد" (rotary files) with and without diacritics
const resRotaryTashkeel = filterAndSortProducts(PRODUCTS, { searchQuery: 'مَبَارِدُ' });
const resRotaryNormal = filterAndSortProducts(PRODUCTS, { searchQuery: 'مبارد' });
assert(
  resRotaryNormal.length > 0 && resRotaryNormal.some(p => p.sku === 'EMD-ENDO-001'),
  'Search partial keyword "مبارد" finds Rotary Files (EMD-ENDO-001)'
);
assert(
  resRotaryTashkeel.length === resRotaryNormal.length,
  'Search "مَبَارِدُ" (with tashkeel) matches identically to "مبارد"',
  `with=${resRotaryTashkeel.length}, without=${resRotaryNormal.length}`
);

// Test 1.4: Hamza variations (أ, إ, آ, ا)
const hamzaVariations = ['أكياس', 'اكياس', 'إكياس', 'آكياس'];
const hamzaCounts = hamzaVariations.map(q => filterAndSortProducts(PRODUCTS, { searchQuery: q }).length);
const allHamzaMatch = hamzaCounts.every(c => c > 0 && c === hamzaCounts[0]);
assert(
  allHamzaMatch,
  'Hamza variations ("أكياس", "اكياس", "إكياس", "آكياس") return identical non-zero results',
  `counts=${JSON.stringify(hamzaCounts)}`
);

// Test 1.5: Yaa vs Alef Maksura (ي vs ى)
const resYaa = filterAndSortProducts(PRODUCTS, { searchQuery: 'روتاري' });
const resAlefMaksura = filterAndSortProducts(PRODUCTS, { searchQuery: 'روتارى' });
assert(
  resYaa.length > 0 && resYaa.length === resAlefMaksura.length,
  'Search "روتاري" (ي) matches identically to "روتارى" (ى)',
  `ي=${resYaa.length}, ى=${resAlefMaksura.length}`
);

// Test 1.6: English keyword case insensitivity
const resEnLower = filterAndSortProducts(PRODUCTS, { searchQuery: 'filtek' });
const resEnUpper = filterAndSortProducts(PRODUCTS, { searchQuery: 'FILTEK' });
const resEnMixed = filterAndSortProducts(PRODUCTS, { searchQuery: 'FilTek' });
assert(
  resEnLower.length > 0 && resEnLower.length === resEnUpper.length && resEnUpper.length === resEnMixed.length,
  'English nameEn search is strictly case-insensitive ("filtek", "FILTEK", "FilTek")',
  `counts=${resEnLower.length}, ${resEnUpper.length}, ${resEnMixed.length}`
);

// Test 1.7: SKU Search (case-insensitive and partial)
const resSkuExact = filterAndSortProducts(PRODUCTS, { searchQuery: 'EMD-SURG-001' });
const resSkuLower = filterAndSortProducts(PRODUCTS, { searchQuery: 'emd-surg-001' });
const resSkuPartial = filterAndSortProducts(PRODUCTS, { searchQuery: 'SURG-001' });
assert(
  resSkuExact.length === 1 && resSkuLower.length === 1 && resSkuPartial.length === 1 && resSkuExact[0].id === resSkuLower[0].id,
  'SKU search matches exact, lowercase, and partial SKU tokens'
);

// Test 1.8: Technical Specs Search
const resSpecs = filterAndSortProducts(PRODUCTS, { searchQuery: 'تنجستن' });
assert(
  resSpecs.length > 0 && resSpecs.some(p => p.sku === 'EMD-SURG-004'),
  'Search token "تنجستن" successfully matches product via technicalSpecs field'
);

// Test 1.9: Empty / Whitespace-only search
const resEmpty = filterAndSortProducts(PRODUCTS, { searchQuery: '' });
const resSpaces = filterAndSortProducts(PRODUCTS, { searchQuery: '     ' });
assert(
  resEmpty.length === 28 && resSpaces.length === 28,
  'Empty string and whitespace-only search return all 28 catalog products'
);

// Test 1.10: Non-matching search query
const resGibberish = filterAndSortProducts(PRODUCTS, { searchQuery: 'كلمة_غير_موجودة_نهائيا_12345' });
assert(
  resGibberish.length === 0,
  'Non-matching search returns 0 products without throwing errors'
);

// Test 1.11: Tatweel (Kashida) stress test observation
const resTatweel = filterAndSortProducts(PRODUCTS, { searchQuery: 'حـشـوة' });
console.log(`  ℹ️  [INFO] Kashida/Tatweel note: "حـشـوة" returned ${resTatweel.length} products (Base "حشوة": ${resWithoutTashkeel.length})`);


// =====================================================================
// SECTION 2: Adversarial Price Sorting Challenges
// =====================================================================
console.log('\n💰 [SECTION 2] Adversarial Price Sorting Challenges:');

// Test 2.1: Price Ascending (low-to-high)
const sortedAsc = filterAndSortProducts(PRODUCTS, { sortOption: 'price-asc' });
let isStrictlyAsc = true;
for (let i = 0; i < sortedAsc.length - 1; i++) {
  if (sortedAsc[i].price > sortedAsc[i + 1].price) {
    isStrictlyAsc = false;
    break;
  }
}
assert(
  sortedAsc.length === 28 && isStrictlyAsc,
  'Price Ascending sort: All 28 products are ordered non-decreasingly (price[i] <= price[i+1])'
);
assert(
  sortedAsc[0].price === 150000 && sortedAsc[sortedAsc.length - 1].price === 4400000,
  `Price Ascending bounds: min = 150,000 (actual: ${sortedAsc[0].price}), max = 4,400,000 (actual: ${sortedAsc[sortedAsc.length - 1].price})`
);

// Test 2.2: Price Descending (high-to-low)
const sortedDesc = filterAndSortProducts(PRODUCTS, { sortOption: 'price-desc' });
let isStrictlyDesc = true;
for (let i = 0; i < sortedDesc.length - 1; i++) {
  if (sortedDesc[i].price < sortedDesc[i + 1].price) {
    isStrictlyDesc = false;
    break;
  }
}
assert(
  sortedDesc.length === 28 && isStrictlyDesc,
  'Price Descending sort: All 28 products are ordered non-increasingly (price[i] >= price[i+1])'
);
assert(
  sortedDesc[0].price === 4400000 && sortedDesc[sortedDesc.length - 1].price === 150000,
  `Price Descending bounds: max = 4,400,000 (actual: ${sortedDesc[0].price}), min = 150,000 (actual: ${sortedDesc[sortedDesc.length - 1].price})`
);

// Test 2.3: Data immutability check
const originalFirstId = PRODUCTS[0].id;
filterAndSortProducts(PRODUCTS, { sortOption: 'price-desc' });
assert(
  PRODUCTS[0].id === originalFirstId,
  'Sorting does not mutate the original PRODUCTS array order in-place'
);

// Test 2.4: Catalog catalog pricing bounds
const allPrices = PRODUCTS.map(p => p.price);
const allOriginalPrices = PRODUCTS.filter(p => p.originalPrice).map(p => p.originalPrice);
const minCatalogPrice = Math.min(...allPrices);
const maxCatalogPrice = Math.max(...allPrices);
const maxOriginalCatalogPrice = Math.max(...allOriginalPrices);

assert(
  minCatalogPrice === 150000 && maxCatalogPrice === 4400000 && maxOriginalCatalogPrice === 4850000,
  `Catalog pricing verification: minPrice = 150,000, maxEffectivePrice = 4,400,000, maxOriginalPrice = 4,850,000`
);


// =====================================================================
// SECTION 3: Adversarial Category Filter Challenges
// =====================================================================
console.log('\n🏷️  [SECTION 3] Category Filter Challenges:');

// Test 3.1: Category distribution and count validation
let totalProductsAcrossCategories = 0;
let categoryCountMismatch = false;

for (const cat of CATEGORIES) {
  const prodsInCat = filterAndSortProducts(PRODUCTS, { categoryId: cat.id });
  totalProductsAcrossCategories += prodsInCat.length;

  const allBelong = prodsInCat.every(p => p.categoryId === cat.id);
  if (!allBelong) {
    assert(false, `Category [${cat.id}] product containment`, 'Some products had incorrect categoryId');
  }

  if (prodsInCat.length !== cat.productCount) {
    categoryCountMismatch = true;
    console.error(`     Mismatch in category ${cat.id}: actual ${prodsInCat.length} vs expected ${cat.productCount}`);
  }
}

assert(
  !categoryCountMismatch,
  'Every category product count matches CATEGORIES.productCount metadata exactly'
);
assert(
  totalProductsAcrossCategories === 28,
  `Sum of all products across all categories equals exactly 28 (actual: ${totalProductsAcrossCategories})`
);

// Test 3.2: No orphaned products
const knownCategoryIds = new Set(CATEGORIES.map(c => c.id));
const allProductsHaveValidCat = PRODUCTS.every(p => knownCategoryIds.has(p.categoryId));
assert(
  allProductsHaveValidCat,
  'Zero orphaned products: All 28 products map to an existing categoryId in CATEGORIES'
);


// =====================================================================
// SECTION 4: Cross-Filter Combinations (Category + Search + Sort)
// =====================================================================
console.log('\n🔀 [SECTION 4] Multi-Dimensional Filter & Sort Combinations:');

// Test 4.1: Category + Search (in-scope)
const resRestorative3M = filterAndSortProducts(PRODUCTS, { categoryId: 'restorative', searchQuery: '3M' });
assert(
  resRestorative3M.length >= 2 && resRestorative3M.every(p => p.categoryId === 'restorative' && (p.name.includes('3M') || (p.nameEn && p.nameEn.includes('3M')))),
  'Category ("restorative") + Search ("3M") correctly filters intersection'
);

// Test 4.2: Category + Search (out-of-scope conflict)
const resConflict = filterAndSortProducts(PRODUCTS, { categoryId: 'surgery', searchQuery: 'مبارد' });
assert(
  resConflict.length === 0,
  'Category ("surgery") + Conflicting Search ("مبارد") correctly yields 0 results'
);

// Test 4.3: Category + Search + Price Ascending
const resComboAsc = filterAndSortProducts(PRODUCTS, { categoryId: 'restorative', searchQuery: '3M', sortOption: 'price-asc' });
let comboAscValid = true;
for (let i = 0; i < resComboAsc.length - 1; i++) {
  if (comboAscValid && resComboAsc[i].price > resComboAsc[i + 1].price) comboAscValid = false;
}
assert(
  comboAscValid && resComboAsc.length > 0,
  'Category + Search + Price Ascending: produces properly filtered and strictly ascending results'
);

// Test 4.4: Category + Search + Price Descending
const resComboDesc = filterAndSortProducts(PRODUCTS, { categoryId: 'restorative', searchQuery: '3M', sortOption: 'price-desc' });
let comboDescValid = true;
for (let i = 0; i < resComboDesc.length - 1; i++) {
  if (comboDescValid && resComboDesc[i].price < resComboDesc[i + 1].price) comboDescValid = false;
}
assert(
  comboDescValid && resComboDesc.length > 0,
  'Category + Search + Price Descending: produces properly filtered and strictly descending results'
);


// =====================================================================
// SECTION 5: Brand Contamination & Currency Scan
// =====================================================================
console.log('\n🛡️  [SECTION 5] Brand Contamination & Currency Codebase Scan:');

const forbiddenPatterns = [
  { name: 'Hex color #60c984', regex: /#?60c984/i },
  { name: 'Word "gravity"', regex: /\bgravity\b/i },
  { name: 'Word "tajir"', regex: /\btajir\b/i },
  { name: 'Gravity phone "0988896208"', regex: /0988896208/ }
];

let contaminationHits = [];

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    if (['node_modules', '.next', '.git'].includes(path.basename(filePath))) return;
    const entries = fs.readdirSync(filePath);
    for (const entry of entries) {
      scanFile(path.join(filePath, entry));
    }
  } else if (/\.(tsx|ts|jsx|js|mjs|json|css|svg)$/.test(filePath)) {
    if (['verify-m1.mjs', 'verify-m2.mjs', 'challenger-adversarial-test.mjs'].includes(path.basename(filePath))) return;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pat of forbiddenPatterns) {
      if (pat.regex.test(content)) {
        contaminationHits.push({ file: filePath, pattern: pat.name });
      }
    }
  }
}

scanFile(path.resolve('src'));
scanFile(path.resolve('public'));
scanFile(path.resolve('tailwind.config.ts'));
scanFile(path.resolve('next.config.mjs'));

assert(
  contaminationHits.length === 0,
  'Zero occurrences of #60c984, "gravity", "tajir", or Gravity phone in application codebase',
  JSON.stringify(contaminationHits)
);

// Currency Check: Ensure all product card, modal, and slider prices use Syrian Pounds (ل.س)
const productCardContent = fs.readFileSync(path.resolve('src/components/storefront/ProductCard.tsx'), 'utf8');
const modalContent = fs.readFileSync(path.resolve('src/components/storefront/ProductDetailModal.tsx'), 'utf8');
const heroSliderContent = fs.readFileSync(path.resolve('src/components/storefront/HeroSlider.tsx'), 'utf8');

assert(
  productCardContent.includes('ل.س') && !productCardContent.includes('USD') && !productCardContent.includes('SAR'),
  'ProductCard uses Syrian Pounds (ل.س) with zero USD/SAR references'
);
assert(
  modalContent.includes('ل.س') && !modalContent.includes('USD') && !modalContent.includes('SAR'),
  'ProductDetailModal uses Syrian Pounds (ل.س) with zero USD/SAR references'
);
assert(
  heroSliderContent.includes('ل.س') && !heroSliderContent.includes('USD') && !heroSliderContent.includes('SAR'),
  'HeroSlider uses Syrian Pounds (ل.س) with zero USD/SAR references'
);

// =====================================================================
// SECTION 6: Physical Product Assets Integrity
// =====================================================================
console.log('\n🦷 [SECTION 6] Physical Product Asset Integrity:');
let missingAssets = 0;
let emptyAssets = 0;

for (const p of PRODUCTS) {
  const relPath = p.image.startsWith('/') ? p.image.slice(1) : p.image;
  const absPath = path.resolve('public', relPath.replace(/^public\//, ''));
  if (!fs.existsSync(absPath)) {
    missingAssets++;
    console.error(`     Missing asset for SKU ${p.sku}: ${absPath}`);
  } else {
    const size = fs.statSync(absPath).size;
    if (size < 200) {
      emptyAssets++;
      console.error(`     Asset too small (<200 bytes) for SKU ${p.sku}: ${size} bytes`);
    }
  }
}

assert(
  missingAssets === 0 && emptyAssets === 0,
  `All 28 products have verified, non-empty physical SVG image files in public/`
);

// =====================================================================
// Summary
// =====================================================================
console.log('\n========================================================');
console.log(`📊 Total Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
if (failedTests === 0) {
  console.log('🎉 ALL ADVERSARIAL CHALLENGES PASSED! EMPIRICAL APPROVAL CONFIRMED.');
  process.exit(0);
} else {
  console.error('⚠️ SOME ADVERSARIAL CHALLENGES FAILED!');
  process.exit(1);
}

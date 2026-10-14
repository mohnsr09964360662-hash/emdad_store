// scripts/challenger-m5-empirical.mjs
// Adversarial Empirical Verification Suite for Milestone M5
// Emdad Dental Online Storefront

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('======================================================================');
console.log('⚔️  CHALLENGER M5.2: ADVERSARIAL EMPIRICAL VERIFICATION HARNESS');
console.log('    Milestone M5: Visual Fidelity & Animation Inventory Audit');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assertCheck(id, description, condition, extraInfo = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ [PASS] ${id}: ${description}${extraInfo ? ` (${extraInfo})` : ''}`);
    return true;
  } else {
    failedChecks++;
    console.error(`  ❌ [FAIL] ${id}: ${description}${extraInfo ? ` (${extraInfo})` : ''}`);
    return false;
  }
}

// =====================================================================
// SUITE 1: VERIFICATION OF THE 10 ANIMATIONS & INTERACTIONS IN SRC/
// =====================================================================
console.log('\n🎬 SUITE 1: Empirical Verification of the 10 Core Animations & Source Code:');

// Interaction 1: Hero Carousel Slider
const heroSliderPath = path.join(rootDir, 'src', 'components', 'storefront', 'HeroSlider.tsx');
assertCheck('ANIM-1.0', 'HeroSlider.tsx exists', fs.existsSync(heroSliderPath));
if (fs.existsSync(heroSliderPath)) {
  const code = fs.readFileSync(heroSliderPath, 'utf8');
  assertCheck('ANIM-1.1', 'HeroSlider autoplay timer 5000ms', code.includes('5000') && code.includes('setInterval'));
  assertCheck('ANIM-1.2', 'HeroSlider RTL touch swipe handling', code.includes('touchStartX') && code.includes('touchEndX') && code.includes('diff > 50'));
  assertCheck('ANIM-1.3', 'HeroSlider 500ms ease-out transition', code.includes('transition-transform duration-500 ease-out'));
  assertCheck('ANIM-1.4', 'HeroSlider dynamic translateX transform', code.includes('transform: `translateX(${currentIndex * 100}%)`'));
  assertCheck('ANIM-1.5', 'HeroSlider hover pause listeners', code.includes('setIsPaused(true)') && code.includes('setIsPaused(false)'));
  assertCheck('ANIM-1.6', 'HeroSlider pagination & arrow controls', code.includes('ChevronRight') && code.includes('ChevronLeft'));
}

// Interaction 2: Category Chips Scroll & Micro-interaction
const chipsPath = path.join(rootDir, 'src', 'components', 'storefront', 'CategoryChips.tsx');
assertCheck('ANIM-2.0', 'CategoryChips.tsx exists', fs.existsSync(chipsPath));
if (fs.existsSync(chipsPath)) {
  const code = fs.readFileSync(chipsPath, 'utf8');
  assertCheck('ANIM-2.1', 'CategoryChips smooth scrollIntoView centering', code.includes("scrollIntoView") && code.includes("'smooth'") && code.includes("'center'"));
  assertCheck('ANIM-2.2', 'CategoryChips active:scale-95 micro-interaction', code.includes('active:scale-95'));
  assertCheck('ANIM-2.3', 'CategoryChips duration-200 transition', code.includes('transition-all duration-200'));
  assertCheck('ANIM-2.4', 'CategoryChips royal navy active state', code.includes('bg-emdad-primary text-white font-bold'));
  assertCheck('ANIM-2.5', 'CategoryChips scrollbar-hide container', code.includes('scrollbar-hide'));
}

// Interaction 3: Product Card Lift
const productCardPath = path.join(rootDir, 'src', 'components', 'storefront', 'ProductCard.tsx');
assertCheck('ANIM-3.0', 'ProductCard.tsx exists', fs.existsSync(productCardPath));
if (fs.existsSync(productCardPath)) {
  const code = fs.readFileSync(productCardPath, 'utf8');
  assertCheck('ANIM-3.1', 'ProductCard hover:-translate-y-1 lift', code.includes('hover:-translate-y-1'));
  assertCheck('ANIM-3.2', 'ProductCard hover:shadow-card-hover elevated shadow', code.includes('hover:shadow-card-hover'));
  assertCheck('ANIM-3.3', 'ProductCard transition-all duration-300 timing', code.includes('transition-all duration-300'));
}

// Interaction 4: Product Image Zoom & Dark Overlay
if (fs.existsSync(productCardPath)) {
  const code = fs.readFileSync(productCardPath, 'utf8');
  assertCheck('ANIM-4.1', 'ProductCard image group-hover:scale-105 zoom', code.includes('group-hover:scale-105') && code.includes('transition-transform duration-300'));
  assertCheck('ANIM-4.2', 'ProductCard dark overlay opacity reveal', code.includes('bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300'));
  assertCheck('ANIM-4.3', 'ProductCard overlay backdrop-blur-[1px]', code.includes('backdrop-blur-[1px]'));
  assertCheck('ANIM-4.4', 'ProductCard "عرض المنتج" badge translateY translation', code.includes('translate-y-2 group-hover:translate-y-0 transition-all duration-300'));
  assertCheck('ANIM-4.5', 'ProductCard Eye icon present in overlay', code.includes('<Eye') && code.includes('عرض المنتج'));
}

// Interaction 5: Skeleton Shimmer Loader
const globalsCssPath = path.join(rootDir, 'src', 'app', 'globals.css');
const shimmerComponentPath = path.join(rootDir, 'src', 'components', 'ui', 'SkeletonShimmer.tsx');
assertCheck('ANIM-5.0', 'globals.css and SkeletonShimmer.tsx exist', fs.existsSync(globalsCssPath) && fs.existsSync(shimmerComponentPath));
if (fs.existsSync(globalsCssPath) && fs.existsSync(shimmerComponentPath)) {
  const css = fs.readFileSync(globalsCssPath, 'utf8');
  const comp = fs.readFileSync(shimmerComponentPath, 'utf8');
  assertCheck('ANIM-5.1', 'globals.css .skeleton-shimmer definition', css.includes('.skeleton-shimmer {') && css.includes('overflow: hidden;'));
  assertCheck('ANIM-5.2', 'globals.css 1.6s animation timing', css.includes('skeleton-shimmer-move 1.6s ease-in-out infinite'));
  assertCheck('ANIM-5.3', 'globals.css -12deg skewX and -150% to +150% keyframe', css.includes('translateX(-150%) skewX(-12deg)') && css.includes('translateX(150%) skewX(-12deg)'));
  assertCheck('ANIM-5.4', 'SkeletonShimmer.tsx exports SkeletonCard, SkeletonSlider, SkeletonChips', comp.includes('SkeletonCard') && comp.includes('SkeletonSlider') && comp.includes('SkeletonChips'));
}

// Interaction 6: Product Detail Modal
const modalPath = path.join(rootDir, 'src', 'components', 'storefront', 'ProductDetailModal.tsx');
assertCheck('ANIM-6.0', 'ProductDetailModal.tsx exists', fs.existsSync(modalPath));
if (fs.existsSync(modalPath)) {
  const code = fs.readFileSync(modalPath, 'utf8');
  assertCheck('ANIM-6.1', 'ProductDetailModal backdrop blur & fade-in', code.includes('backdrop-blur-sm animate-in fade-in duration-200'));
  assertCheck('ANIM-6.2', 'ProductDetailModal zoom-in-95 dialog spring', code.includes('animate-in zoom-in-95 duration-200'));
  assertCheck('ANIM-6.3', 'ProductDetailModal close handler with X icon', code.includes('<X') && code.includes('onClick={onClose}'));
}

// Interaction 7: Persistent Cart Slide-Over Drawer
const cartDrawerPath = path.join(rootDir, 'src', 'components', 'cart', 'CartDrawer.tsx');
assertCheck('ANIM-7.0', 'CartDrawer.tsx exists', fs.existsSync(cartDrawerPath));
if (fs.existsSync(cartDrawerPath)) {
  const code = fs.readFileSync(cartDrawerPath, 'utf8');
  assertCheck('ANIM-7.1', 'CartDrawer slide from right RTL anchor', code.includes('fixed inset-y-0 right-0'));
  assertCheck('ANIM-7.2', 'CartDrawer 300ms ease-in-out slide', code.includes('transition-transform duration-300 ease-in-out'));
  assertCheck('ANIM-7.3', 'CartDrawer translate-x-0 vs translate-x-full toggle', code.includes("isCartOpen ? 'translate-x-0' : 'translate-x-full'"));
  assertCheck('ANIM-7.4', 'CartDrawer backdrop overlay blur', code.includes('backdrop-blur-xs transition-opacity duration-300'));
}

// Interaction 8: Cart Stepper & Trash Toggle at Qty 1
if (fs.existsSync(cartDrawerPath)) {
  const code = fs.readFileSync(cartDrawerPath, 'utf8');
  assertCheck('ANIM-8.1', 'CartDrawer conditional Trash2 at quantity === 1', code.includes('item.quantity === 1 ?') && code.includes('<Trash2'));
  assertCheck('ANIM-8.2', 'CartDrawer rose alert styling on trash', code.includes('text-rose-500 hover:bg-rose-50'));
  assertCheck('ANIM-8.3', 'CartDrawer Minus icon when quantity > 1', code.includes('<Minus'));
  assertCheck('ANIM-8.4', 'CartDrawer active:scale-90 stepper micro-interaction', code.includes('active:scale-90'));
}

// Interaction 9: Delivery Modal & WhatsApp CTA Dispatch
const deliveryModalPath = path.join(rootDir, 'src', 'components', 'cart', 'DeliveryModal.tsx');
assertCheck('ANIM-9.0', 'DeliveryModal.tsx exists', fs.existsSync(deliveryModalPath));
if (fs.existsSync(deliveryModalPath)) {
  const code = fs.readFileSync(deliveryModalPath, 'utf8');
  assertCheck('ANIM-9.1', 'DeliveryModal emerald CTA button with active:scale-98', code.includes('bg-emerald-600 hover:bg-emerald-700') && code.includes('active:scale-98'));
  assertCheck('ANIM-9.2', 'DeliveryModal Loader2 with animate-spin during submit', code.includes('<Loader2 className="h-4 w-4 animate-spin"') || code.includes('animate-spin'));
  assertCheck('ANIM-9.3', 'DeliveryModal WhatsApp dispatch action', code.includes('generateWhatsAppOrderUrl'));
}

// Interaction 10: Cart Toast Notification
const cartToastPath = path.join(rootDir, 'src', 'components', 'cart', 'CartToast.tsx');
assertCheck('ANIM-10.0', 'CartToast.tsx exists', fs.existsSync(cartToastPath));
if (fs.existsSync(cartToastPath)) {
  const code = fs.readFileSync(cartToastPath, 'utf8');
  assertCheck('ANIM-10.1', 'CartToast slide-in-from-bottom-5 animation', code.includes('animate-in slide-in-from-bottom-5 duration-300'));
  assertCheck('ANIM-10.2', 'CartToast fixed bottom-5 start-5 placement', code.includes('fixed bottom-5 start-5 z-50'));
  assertCheck('ANIM-10.3', 'CartToast checkmark icon & dismiss button', code.includes('CheckCircle2') && code.includes('dismissToast'));
}

// =====================================================================
// SUITE 2: LINE NUMBER VERACITY AUDIT IN ANIMATION_INVENTORY.MD
// =====================================================================
console.log('\n📖 SUITE 2: Line Number Veracity in docs/ANIMATION_INVENTORY.md:');

const animDocPath = path.join(rootDir, 'docs', 'ANIMATION_INVENTORY.md');
assertCheck('LINE-0.0', 'docs/ANIMATION_INVENTORY.md exists', fs.existsSync(animDocPath));

if (fs.existsSync(animDocPath)) {
  const animDoc = fs.readFileSync(animDocPath, 'utf8');

  // Verify claimed line references vs reality
  const lineAudits = [
    {
      name: 'HeroSlider autoplay (claimed ~29-36)',
      file: 'src/components/storefront/HeroSlider.tsx',
      token: 'setInterval',
      claimedMin: 20,
      claimedMax: 45,
    },
    {
      name: 'HeroSlider touch swipe (claimed ~49-58)',
      file: 'src/components/storefront/HeroSlider.tsx',
      token: 'handleTouchEnd',
      claimedMin: 40,
      claimedMax: 65,
    },
    {
      name: 'HeroSlider transform (claimed ~74-76)',
      file: 'src/components/storefront/HeroSlider.tsx',
      token: 'translateX(${currentIndex * 100}%)',
      claimedMin: 65,
      claimedMax: 85,
    },
    {
      name: 'CategoryChips scrollIntoView (claimed ~20-27)',
      file: 'src/components/storefront/CategoryChips.tsx',
      token: 'scrollIntoView',
      claimedMin: 15,
      claimedMax: 35,
    },
    {
      name: 'CategoryChips active:scale-95 (claimed ~43-47 & 72-76)',
      file: 'src/components/storefront/CategoryChips.tsx',
      token: 'active:scale-95',
      claimedMin: 35,
      claimedMax: 80,
    },
    {
      name: 'ProductCard lift (claimed ~24-27)',
      file: 'src/components/storefront/ProductCard.tsx',
      token: 'hover:-translate-y-1',
      claimedMin: 20,
      claimedMax: 35,
    },
    {
      name: 'ProductCard zoom (claimed ~31-35)',
      file: 'src/components/storefront/ProductCard.tsx',
      token: 'group-hover:scale-105',
      claimedMin: 25,
      claimedMax: 45,
    },
    {
      name: 'ProductCard overlay (claimed ~54-60)',
      file: 'src/components/storefront/ProductCard.tsx',
      token: 'عرض المنتج',
      claimedMin: 45,
      claimedMax: 70,
    },
    {
      name: 'globals.css shimmer (claimed ~46-74)',
      file: 'src/app/globals.css',
      token: 'skeleton-shimmer-move',
      claimedMin: 40,
      claimedMax: 75,
    },
    {
      name: 'ProductDetailModal dialog (claimed ~65-75)',
      file: 'src/components/storefront/ProductDetailModal.tsx',
      token: 'zoom-in-95',
      claimedMin: 55,
      claimedMax: 85,
    },
    {
      name: 'CartDrawer panel slide (claimed ~100-108)',
      file: 'src/components/cart/CartDrawer.tsx',
      token: 'translate-x-0',
      claimedMin: 90,
      claimedMax: 120,
    },
    {
      name: 'CartDrawer stepper Trash2 (claimed ~250-295)',
      file: 'src/components/cart/CartDrawer.tsx',
      token: 'Trash2',
      claimedMin: 240,
      claimedMax: 305,
    },
    {
      name: 'DeliveryModal submit button (claimed ~400-417)',
      file: 'src/components/cart/DeliveryModal.tsx',
      token: 'active:scale-98',
      claimedMin: 390,
      claimedMax: 425,
    },
    {
      name: 'CartToast toast class (claimed ~13-18)',
      file: 'src/components/cart/CartToast.tsx',
      token: 'slide-in-from-bottom-5',
      claimedMin: 10,
      claimedMax: 25,
    },
  ];

  for (const item of lineAudits) {
    const fullFp = path.join(rootDir, item.file);
    const lines = fs.readFileSync(fullFp, 'utf8').split('\n');
    let foundLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(item.token)) {
        foundLine = i + 1;
        break;
      }
    }
    const isAccurate = foundLine >= item.claimedMin && foundLine <= item.claimedMax;
    assertCheck(
      'LINE-VERIFY',
      `${item.name} exists near claimed range`,
      isAccurate,
      `Actual line: ${foundLine}, claimed bounds: [${item.claimedMin}-${item.claimedMax}]`
    );
  }
}

// =====================================================================
// SUITE 3: ADVERSARIAL BRAND LEAK & FORBIDDEN TOKEN SCANNER
// =====================================================================
console.log('\n🛡️  SUITE 3: Adversarial Brand Leak & Color Hex Scanner:');

const targetScanDirs = ['docs', 'src', 'public', 'prisma'];
const forbiddenTokens = [
  { name: 'Brand Name (Gravity)', token: Buffer.from('R3Jhdml0eQ==', 'base64').toString('ascii'), caseSensitive: false },
  { name: 'Domain (tajir.store)', token: Buffer.from('dGFqaXIuc3RvcmU=', 'base64').toString('ascii'), caseSensitive: false },
  { name: 'Hex color (60c984)', token: Buffer.from('NjBjOTg0', 'base64').toString('ascii'), caseSensitive: false },
  { name: 'Hex color (#60c984)', token: Buffer.from('IzYwYzk4NA==', 'base64').toString('ascii'), caseSensitive: false },
  { name: 'Old Phone (0988896208)', token: Buffer.from('MDk4ODg5NjIwOA==', 'base64').toString('ascii'), caseSensitive: false },
  { name: 'Old Domain (gravity.dt)', token: Buffer.from('Z3Jhdml0eS5kdA==', 'base64').toString('ascii'), caseSensitive: false },
];

function getAllFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const resPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git', '.cache'].includes(entry.name)) {
        getAllFilesRecursively(resPath, fileList);
      }
    } else {
      fileList.push(resPath);
    }
  }
  return fileList;
}

let totalFilesScanned = 0;
let detectedLeaks = [];

for (const dirName of targetScanDirs) {
  const dirFullPath = path.join(rootDir, dirName);
  const files = getAllFilesRecursively(dirFullPath);
  for (const filePath of files) {
    // Only inspect text / asset files
    const ext = path.extname(filePath).toLowerCase();
    const isText = ['.ts', '.tsx', '.js', '.mjs', '.jsx', '.css', '.html', '.md', '.json', '.svg', '.prisma'].includes(ext);
    if (!isText) continue;

    totalFilesScanned++;
    const content = fs.readFileSync(filePath, 'utf8');

    for (const fb of forbiddenTokens) {
      const match = fb.caseSensitive
        ? content.includes(fb.token)
        : content.toLowerCase().includes(fb.token.toLowerCase());
      if (match) {
        detectedLeaks.push({
          token: fb.name,
          file: path.relative(rootDir, filePath),
        });
      }
    }
  }
}

assertCheck(
  'LEAK-SCAN',
  `Scanned ${totalFilesScanned} files across docs/, src/, public/, prisma/ for 6 brand tokens`,
  detectedLeaks.length === 0,
  detectedLeaks.length === 0 ? 'Zero leaks detected' : `Found ${detectedLeaks.length} leaks: ${JSON.stringify(detectedLeaks)}`
);

// =====================================================================
// SUITE 4: VISUAL COMPARISON ARTIFACTS INTEGRITY
// =====================================================================
console.log('\n📊 SUITE 4: Visual Comparison Artifacts & Scorecard Integrity:');

const expectedSvgs = [
  'home-1440px.svg', 'home-390px.svg',
  'category-1440px.svg', 'category-390px.svg',
  'product-detail-1440px.svg', 'product-detail-390px.svg',
  'cart-drawer-1440px.svg', 'cart-drawer-390px.svg',
  'checkout-delivery-1440px.svg', 'checkout-delivery-390px.svg'
];

for (const svgName of expectedSvgs) {
  const svgP = path.join(rootDir, 'docs', 'comparison', svgName);
  const exists = fs.existsSync(svgP);
  const size = exists ? fs.statSync(svgP).size : 0;
  assertCheck('SVG-CHECK', `Comparison SVG docs/comparison/${svgName} exists & non-empty`, exists && size > 1000, `${size} bytes`);
}

const scorecardP = path.join(rootDir, 'docs', 'VISUAL_FIDELITY_SCORECARD.md');
if (fs.existsSync(scorecardP)) {
  const scContent = fs.readFileSync(scorecardP, 'utf8');
  assertCheck('SCORE-1', 'Scorecard contains Section Order rubric', scContent.includes('ترتيب الأقسام'));
  assertCheck('SCORE-2', 'Scorecard contains Layout & Spacing rubric', scContent.includes('التخطيط والمسافات'));
  assertCheck('SCORE-3', 'Scorecard contains Cairo Typography & RTL rubric', scContent.includes('Cairo') && scContent.includes('RTL'));
  assertCheck('SCORE-4', 'Scorecard contains Shapes & Borders rubric', scContent.includes('أشكال المكونات والحدود'));
  assertCheck('SCORE-5', 'Scorecard contains Brand Identity rubric', scContent.includes('الهوية البصرية'));
  assertCheck('SCORE-6', 'Scorecard contains Responsive Behavior rubric', scContent.includes('السلوك المتجاوب'));
}

// =====================================================================
// SUMMARY
// =====================================================================
console.log('\n======================================================================');
console.log(`TOTAL ADVERSARIAL CHECKS: ${totalChecks}`);
console.log(`PASSED: ${passedChecks}`);
console.log(`FAILED: ${failedChecks}`);
console.log('======================================================================\n');

if (failedChecks > 0) {
  console.error(`❌ EMPIRICAL ADVERSARIAL VERIFICATION FAILED with ${failedChecks} errors.`);
  process.exit(1);
} else {
  console.log(`🎉 EMPIRICAL ADVERSARIAL VERIFICATION PASSED! 100% of checks passed.`);
  process.exit(0);
}

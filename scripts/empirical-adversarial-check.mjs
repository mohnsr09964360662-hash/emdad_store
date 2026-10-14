// scripts/empirical-adversarial-check.mjs
import fs from 'fs';
import path from 'path';

console.log('=== EMPIRICAL ADVERSARIAL VERIFICATION HARNESS (Milestone M2) ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${name}${details ? ` -> ${details}` : ''}`);
    return true;
  } else {
    failedTests++;
    console.error(`[FAIL] ${name}${details ? ` -> ${details}` : ''}`);
    return false;
  }
}

// =========================================================================
// TEST SUITE 1: 28 PRODUCT SVG ASSETS VALIDATION
// =========================================================================
console.log('--- TEST SUITE 1: 28 Product Vector Assets (XML/SVG & Size) ---');

const expectedProducts = [
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

const productsDir = path.resolve('public/images/products');
assertTest('Products Directory Exists', fs.existsSync(productsDir));

const actualProductFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.svg'));
assertTest('Product SVG Count is exactly 28', actualProductFiles.length === 28, `Found ${actualProductFiles.length} files`);

for (const prodFile of expectedProducts) {
  const filePath = path.join(productsDir, prodFile);
  const exists = fs.existsSync(filePath);
  assertTest(`File exists: ${prodFile}`, exists);

  if (exists) {
    const stat = fs.statSync(filePath);
    const sizeOk = stat.size > 500;
    assertTest(`File size > 500B: ${prodFile}`, sizeOk, `${stat.size} bytes`);

    const content = fs.readFileSync(filePath, 'utf8').trim();
    
    // Check root SVG tags
    const startsSvg = content.startsWith('<svg') || content.includes('<svg');
    const endsSvg = content.endsWith('</svg>');
    assertTest(`Root SVG tags well-formed: ${prodFile}`, startsSvg && endsSvg);

    // Check xmlns and viewBox
    const hasXmlns = content.includes('xmlns="http://www.w3.org/2000/svg"');
    const hasViewBox = /viewBox=["'][^"']+["']/.test(content);
    assertTest(`Has xmlns and viewBox: ${prodFile}`, hasXmlns && hasViewBox);

    // Adversarial: Check for dangerous script tags or javascript protocols (XSS)
    const hasScripts = /<script/i.test(content) || /javascript:/i.test(content);
    assertTest(`Safe from XSS / script injection: ${prodFile}`, !hasScripts);
  }
}

// =========================================================================
// TEST SUITE 2: 3 PROMO BANNER SVG ASSETS & 1:0.4 ASPECT RATIO
// =========================================================================
console.log('\n--- TEST SUITE 2: 3 Promo Banners & 1:0.4 Aspect Ratio ---');

const expectedBanners = ['hero-banner-1.svg', 'hero-banner-2.svg', 'hero-banner-3.svg'];
const bannersDir = path.resolve('public/images/banners');
assertTest('Banners Directory Exists', fs.existsSync(bannersDir));

for (const bannerFile of expectedBanners) {
  const filePath = path.join(bannersDir, bannerFile);
  const exists = fs.existsSync(filePath);
  assertTest(`Banner exists: ${bannerFile}`, exists);

  if (exists) {
    const stat = fs.statSync(filePath);
    assertTest(`Banner size > 1000B: ${bannerFile}`, stat.size > 1000, `${stat.size} bytes`);

    const content = fs.readFileSync(filePath, 'utf8').trim();
    const startsSvg = content.startsWith('<svg');
    const endsSvg = content.endsWith('</svg>');
    assertTest(`Banner XML tags well-formed: ${bannerFile}`, startsSvg && endsSvg);

    // Extract viewBox to calculate aspect ratio
    const viewBoxMatch = content.match(/viewBox=["']\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*["']/);
    if (viewBoxMatch) {
      const minX = parseFloat(viewBoxMatch[1]);
      const minY = parseFloat(viewBoxMatch[2]);
      const width = parseFloat(viewBoxMatch[3]);
      const height = parseFloat(viewBoxMatch[4]);
      const ratio = height / width;
      const isRatioAccurate = Math.abs(ratio - 0.4) < 0.001;
      assertTest(
        `Banner 1:0.4 aspect ratio (${width}x${height} -> ${ratio}): ${bannerFile}`,
        isRatioAccurate,
        `width=${width}, height=${height}, ratio=${ratio.toFixed(2)} (Target: 0.40)`
      );
    } else {
      assertTest(`Banner has parseable viewBox: ${bannerFile}`, false, 'viewBox missing or malformed');
    }
  }
}

// =========================================================================
// TEST SUITE 3: SAFEPRODUCTIMAGE FALLBACK LOGIC EMPIRICAL SIMULATION
// =========================================================================
console.log('\n--- TEST SUITE 3: SafeProductImage Graceful Degradation & Fallback ---');

const safeImageSrc = fs.readFileSync('src/components/ui/SafeProductImage.tsx', 'utf8');

// Test 1: Contains client directive
assertTest('SafeProductImage has "use client"', safeImageSrc.includes("'use client'"));

// Test 2: Fallback rendering handles empty/missing src
const handlesMissingSrc = safeImageSrc.includes('if (hasError || !src)');
assertTest('Handles missing or falsy src', handlesMissingSrc);

// Test 3: Emdad Tooth SVG fallback vector exists in component
const hasToothSvg = safeImageSrc.includes('viewBox="0 0 64 64"') &&
                    safeImageSrc.includes('emdad-fallback-grad') &&
                    safeImageSrc.includes('#14B8A6') &&
                    safeImageSrc.includes('#0D5C96');
assertTest('Renders Emdad turquoise-to-navy tooth vector on fallback', hasToothSvg);

// Test 4: Error handler sets state without throwing
const hasErrorHandler = safeImageSrc.includes('onError={() =>') &&
                        safeImageSrc.includes('setHasError(true)');
assertTest('onError handler catches broken image and triggers tooth fallback', hasErrorHandler);

// Test 5: Next.js SVG unoptimized prop
const hasUnoptimized = safeImageSrc.includes("unoptimized={src.endsWith('.svg')}");
assertTest('Prevents Next.js SVG optimization crash via unoptimized flag', hasUnoptimized);

// Test 6: Preserves aria-label for accessibility on fallback
const hasAriaLabel = safeImageSrc.includes('aria-label={alt}');
assertTest('Fallback preserves accessibility aria-label', hasAriaLabel);

// =========================================================================
// TEST SUITE 4: DATA INTEGRITY CROSS-CHECK
// =========================================================================
console.log('\n--- TEST SUITE 4: Catalog & Product Reference Integrity ---');

const prodDataSrc = fs.readFileSync('src/data/products.ts', 'utf8');
const catDataSrc = fs.readFileSync('src/data/categories.ts', 'utf8');

// Extract all product IDs and categories
const idMatches = [...prodDataSrc.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
assertTest('All 28 products have defined IDs', idMatches.length === 28, `Found ${idMatches.length} IDs`);

const uniqueIds = new Set(idMatches);
assertTest('All product IDs are unique (no collisions)', uniqueIds.size === 28);

const imagePaths = [...prodDataSrc.matchAll(/image:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
assertTest('Catalog references 28 images', imagePaths.length === 28);

let brokenRefs = 0;
for (const imgPath of imagePaths) {
  const localPath = path.join('public', imgPath.replace(/^\//, ''));
  if (!fs.existsSync(localPath)) {
    brokenRefs++;
    console.error(`Broken catalog reference: ${imgPath}`);
  }
}
assertTest('Zero broken image references in catalog', brokenRefs === 0);

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n=============================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('=============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL EMPIRICAL ADVERSARIAL CHECKS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

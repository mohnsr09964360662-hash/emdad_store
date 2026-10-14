// scripts/verify-m4.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🦷 Emdad Dental Store — Milestone M4 Automated Verification Suite');
console.log('═══════════════════════════════════════════════════════════════════\n');

let failed = false;
function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed = true;
  }
}

// -------------------------------------------------------------
// 1. Prisma Schema & 7 Relational Models
// -------------------------------------------------------------
console.log('📐 1. Verifying Prisma Schema & 7 Models:');
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
assert(fs.existsSync(schemaPath), 'prisma/schema.prisma exists');

if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  assert(schemaContent.includes('provider = "sqlite"') && schemaContent.includes('file:'), 'SQLite datasource configured');

  const requiredModels = [
    'AdminUser',
    'StoreSettings',
    'Category',
    'Product',
    'Banner',
    'Order',
    'OrderItem',
  ];

  for (const model of requiredModels) {
    const hasModel = new RegExp(`model\\s+${model}\\b`).test(schemaContent);
    assert(hasModel, `Model defined: model ${model}`);
  }
}

// -------------------------------------------------------------
// 2. All 12 REST API Route Handlers
// -------------------------------------------------------------
console.log('\n🌐 2. Verifying 12 REST API Route Handlers:');
const requiredApiRoutes = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/categories/[id]/route.ts',
  'src/app/api/banners/route.ts',
  'src/app/api/banners/[id]/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/upload/route.ts',
];

for (const route of requiredApiRoutes) {
  const exists = fs.existsSync(path.join(rootDir, route));
  assert(exists, `API route file exists: ${route}`);
}

// -------------------------------------------------------------
// 3. All 7 Admin Dashboard Pages & Layout
// -------------------------------------------------------------
console.log('\n🖥️ 3. Verifying 7 Admin Dashboard UI Pages:');
const requiredAdminPages = [
  'src/app/admin/login/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/products/page.tsx',
  'src/app/admin/categories/page.tsx',
  'src/app/admin/banners/page.tsx',
  'src/app/admin/orders/page.tsx',
];

for (const page of requiredAdminPages) {
  const exists = fs.existsSync(path.join(rootDir, page));
  assert(exists, `Admin page file exists: ${page}`);
}

// -------------------------------------------------------------
// 4. Prestart Hook & Seed Script Files
// -------------------------------------------------------------
console.log('\n⚡ 4. Verifying Zero-Config Prestart Hook & Seed Scripts:');
const prestartPath = path.join(rootDir, 'scripts', 'prestart.mjs');
const seedPath = path.join(rootDir, 'scripts', 'seed.mjs');
assert(fs.existsSync(prestartPath), 'scripts/prestart.mjs exists');
assert(fs.existsSync(seedPath), 'scripts/seed.mjs exists');

if (fs.existsSync(seedPath)) {
  const seedContent = fs.readFileSync(seedPath, 'utf8');
  assert(seedContent.includes('admin@emdad-dental.com'), 'Seed script includes admin@emdad-dental.com');
  assert(seedContent.includes('28') || seedContent.includes('PRODUCTS_DATA'), 'Seed script includes 28 products data');
  assert(seedContent.includes('CATEGORIES_DATA'), 'Seed script includes categories data');
  assert(seedContent.includes('BANNERS_DATA'), 'Seed script includes banners data');
}

// -------------------------------------------------------------
// 5. Dual-Channel Customer Checkout Verification
// -------------------------------------------------------------
console.log('\n🛒 5. Verifying Dual-Channel Customer Checkout:');
const deliveryModalPath = path.join(rootDir, 'src', 'components', 'cart', 'DeliveryModal.tsx');
assert(fs.existsSync(deliveryModalPath), 'src/components/cart/DeliveryModal.tsx exists');
if (fs.existsSync(deliveryModalPath)) {
  const modalContent = fs.readFileSync(deliveryModalPath, 'utf8');
  assert(modalContent.includes('/api/orders'), 'DeliveryModal posts order to /api/orders');
  assert(modalContent.includes('generateWhatsAppOrderUrl'), 'DeliveryModal generates WhatsApp order URL');
}

// -------------------------------------------------------------
// 6. Anti-Leak Brand Audit (Zero Gravity Leaks)
// -------------------------------------------------------------
console.log('\n🧹 6. Verifying Anti-Leak Brand Cleanliness:');
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
    if (path.basename(targetPath).startsWith('verify-')) return;
    const content = fs.readFileSync(targetPath, 'utf8');
    for (const term of forbiddenTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        console.error(`     Forbidden leak "${term}" in: ${targetPath}`);
        leakFound = true;
      }
    }
  }
}

scanPath(path.join(rootDir, 'src', 'app', 'admin'));
scanPath(path.join(rootDir, 'src', 'app', 'api'));
assert(!leakFound, 'Zero forbidden Gravity colors or references in admin & API routes');

// -------------------------------------------------------------
// 7. SQLite dev.db & Database Record Counts
// -------------------------------------------------------------
console.log('\n📦 7. Verifying SQLite dev.db & Live Record Counts:');
const dbPath = path.join(rootDir, 'prisma', 'dev.db');
const dbExists = fs.existsSync(dbPath);
assert(dbExists, 'prisma/dev.db SQLite database file exists');

if (dbExists) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const [adminCount, catCount, prodCount, bannerCount, settings] = await Promise.all([
      prisma.adminUser.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.banner.count(),
      prisma.storeSettings.findFirst(),
    ]);

    assert(adminCount >= 1, `AdminUser count: ${adminCount} (>= 1)`);
    assert(catCount >= 8, `Category count: ${catCount} (>= 8)`);
    assert(prodCount >= 28, `Product count: ${prodCount} (>= 28)`);
    assert(bannerCount >= 3, `Banner count: ${bannerCount} (>= 3)`);
    assert(!!settings, 'StoreSettings singleton row seeded');

    const admin = await prisma.adminUser.findUnique({ where: { email: 'admin@emdad-dental.com' } });
    assert(!!admin, 'Default admin user exists (admin@emdad-dental.com)');

    await prisma.$disconnect();
  } catch (dbErr) {
    console.error('Database query error:', dbErr.message);
    assert(false, `Database query check failed: ${dbErr.message}`);
  }
}

// -------------------------------------------------------------
// 8. Jose Web Crypto Package Verification
// -------------------------------------------------------------
console.log('\n🔐 8. Verifying Edge-Compatible Jose Web Crypto Package:');
const josePackagePath = path.join(rootDir, 'node_modules', 'jose', 'package.json');
const joseIndexPath = path.join(rootDir, 'node_modules', 'jose', 'index.js');
const joseTypesPath = path.join(rootDir, 'node_modules', 'jose', 'index.d.ts');
assert(fs.existsSync(josePackagePath), 'node_modules/jose/package.json exists');
assert(fs.existsSync(joseIndexPath), 'node_modules/jose/index.js exists');
assert(fs.existsSync(joseTypesPath), 'node_modules/jose/index.d.ts exists');

if (fs.existsSync(joseIndexPath)) {
  try {
    const { SignJWT, jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode('test-verify-secret-key-1234567890');
    const token = await new SignJWT({ sub: 'admin-test', role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);
    const { payload } = await jwtVerify(token, secret);
    assert(payload.sub === 'admin-test' && payload.role === 'ADMIN', 'Jose SignJWT and jwtVerify work with HS256');
  } catch (joseErr) {
    assert(false, `Jose verification failed: ${joseErr.message}`);
  }
}

// -------------------------------------------------------------
// 9. Storefront Live API Data Synchronization
// -------------------------------------------------------------
console.log('\n🔄 9. Verifying Storefront Live API Data Synchronization:');
const storefrontPath = path.join(rootDir, 'src', 'app', 'page.tsx');
assert(fs.existsSync(storefrontPath), 'src/app/page.tsx exists');
if (fs.existsSync(storefrontPath)) {
  const storefrontContent = fs.readFileSync(storefrontPath, 'utf8');
  assert(storefrontContent.includes('/api/products'), 'Storefront queries /api/products');
  assert(storefrontContent.includes('/api/categories'), 'Storefront queries /api/categories');
  assert(storefrontContent.includes('/api/banners'), 'Storefront queries /api/banners');
  assert(storefrontContent.includes('setProducts'), 'Storefront updates products state from API');
  assert(storefrontContent.includes('setCategories'), 'Storefront updates categories state from API');
  assert(storefrontContent.includes('setBanners'), 'Storefront updates banners state from API');
}

// -------------------------------------------------------------
// 10. Dynamic Route Handlers Verification
// -------------------------------------------------------------
console.log('\n⚡ 10. Verifying Dynamic Route Handler Exports:');
const dynamicRoutes = [
  'src/app/api/products/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/banners/route.ts',
];
for (const route of dynamicRoutes) {
  const content = fs.readFileSync(path.join(rootDir, route), 'utf8');
  assert(
    content.includes("export const dynamic = 'force-dynamic';") ||
      content.includes('export const dynamic = "force-dynamic";'),
    `force-dynamic configured in ${route}`
  );
}

// -------------------------------------------------------------
// Final Assessment
// -------------------------------------------------------------
console.log('\n═══════════════════════════════════════════════════════════════════');
if (failed) {
  console.error('❌ M4 Verification Status: FAILED. Please review the errors above.');
  process.exit(1);
} else {
  console.log('🎉 M4 Verification Status: ALL CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}

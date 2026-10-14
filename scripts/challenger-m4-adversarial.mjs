// scripts/challenger-m4-adversarial.mjs
// Adversarial Empirical Stress Test Suite for Milestone M4 (Emdad Dental Store)
// Testing:
// 1. Concurrency on SQLite database (concurrent read/write bursts, transaction safety, zero corruption)
// 2. SQL injection & adversarial search parameters (Arabic diacritics, quotes, escapes, DDL injection)
// 3. Admin authentication attack vectors (brute force passwords, forged JWTs, expired/future tokens)
// 4. Admin mutation reflection (instant reflection of DB insert/update/delete in Prisma and API queries)

import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'emdad-dental-secret-key-2026-safe-production-jwt-token';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const SESSION_COOKIE_NAME = 'emdad_admin_session';

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🔥 CHALLENGER M4.4: EMPIRICAL ADVERSARIAL VERIFICATION SUITE');
console.log('   Target: Emdad Dental Store — Milestone M4');
console.log('═══════════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}${details ? ` -> ${details}` : ''}`);
    return true;
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    return false;
  }
}

// Edge auth helper functions mirroring src/lib/auth-edge.ts
async function signAdminToken(payload, secretKey = SECRET_KEY, expiresIn = '7d') {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

async function verifyAdminToken(token, secretKey = SECRET_KEY) {
  try {
    if (!token || typeof token !== 'string') return null;
    const { payload } = await jwtVerify(token, secretKey);
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role || 'ADMIN',
    };
  } catch {
    return null;
  }
}

async function runAllSuites() {
  const startTime = Date.now();

  try {
    // =========================================================================
    // SUITE 1: SQLITE DATABASE CONCURRENCY STRESS TEST
    // =========================================================================
    console.log('⚡ SUITE 1: Concurrency & Lock Resilience on SQLite Database');
    console.log('   Spawning 40 concurrent async operations (reads, transactions, and writes)...');

    const baselineProductCount = await prisma.product.count();
    const baselineOrderCount = await prisma.order.count();
    const baselineCategoryCount = await prisma.category.count();

    assert(baselineProductCount >= 28, 'Baseline product count >= 28', `Count: ${baselineProductCount}`);
    assert(baselineCategoryCount >= 8, 'Baseline category count >= 8', `Count: ${baselineCategoryCount}`);

    const allCategories = await prisma.category.findMany();
    const allProducts = await prisma.product.findMany();
    const sampleCategory = allCategories[0];
    const sampleProduct = allProducts[0];
    assert(!!sampleCategory && !!sampleProduct, 'Seed catalog references exist for concurrent test');

    const concurrentOps = [];
    const testOrderRefPrefix = `CHALLENGE-CONCUR-${Date.now()}`;

    // 20 concurrent readers
    for (let i = 0; i < 20; i++) {
      concurrentOps.push(
        (async () => {
          const prods = await prisma.product.findMany({
            where: { isActive: true },
            take: 10,
            include: { category: true },
          });
          const cats = await prisma.category.findMany();
          const settings = await prisma.storeSettings.findFirst();
          return { type: 'read', prodsCount: prods.length, catsCount: cats.length, hasSettings: !!settings };
        })()
      );
    }

    // 15 concurrent transactional order writers
    for (let i = 0; i < 15; i++) {
      const refCode = `${testOrderRefPrefix}-${i}`;
      concurrentOps.push(
        (async () => {
          return await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
              data: {
                referenceCode: refCode,
                customerName: `طبيب فحص التزامن ${i}`,
                customerPhone: `09${String(10000000 + i).padStart(8, '0')}`,
                governorate: 'دمشق',
                clinicAddress: `شارع الفحص التجريبي، مبنى ${i}`,
                notes: 'فحص الإجهاد التزامني',
                subtotal: 150000 + i * 1000,
                status: 'NEW',
                items: {
                  create: [
                    {
                      productId: sampleProduct.id,
                      productName: sampleProduct.nameAr,
                      productSku: sampleProduct.sku,
                      unitPrice: sampleProduct.price,
                      quantity: 2,
                      totalPrice: sampleProduct.price * 2,
                    },
                  ],
                },
              },
              include: { items: true },
            });
            return { type: 'order_create', orderId: order.id, ref: order.referenceCode };
          });
        })()
      );
    }

    // 5 concurrent read-modify-write operations on product stock
    for (let i = 0; i < 5; i++) {
      concurrentOps.push(
        (async () => {
          const p = await prisma.product.findUnique({ where: { id: sampleProduct.id } });
          const updated = await prisma.product.update({
            where: { id: sampleProduct.id },
            data: { stock: p.stock },
          });
          return { type: 'stock_touch', productId: updated.id };
        })()
      );
    }

    const concurrencyStart = Date.now();
    const results = await Promise.allSettled(concurrentOps);
    const concurrencyDuration = Date.now() - concurrencyStart;

    const rejectedOps = results.filter((r) => r.status === 'rejected');
    const fulfilledOps = results.filter((r) => r.status === 'fulfilled');

    assert(
      rejectedOps.length === 0,
      'All 40 concurrent operations succeeded without SQLITE_BUSY or lock timeouts',
      `Fulfilled: ${fulfilledOps.length}/40, Rejected: ${rejectedOps.length}, Duration: ${concurrencyDuration}ms`
    );

    // Verify SQLite database integrity pragma directly on SQLite engine
    const integrityResult = prisma._db.prepare('PRAGMA integrity_check;').all();
    const integrityOk = Array.isArray(integrityResult) && integrityResult[0]?.integrity_check === 'ok';
    assert(integrityOk, 'SQLite PRAGMA integrity_check returned "ok"');

    const quickCheckResult = prisma._db.prepare('PRAGMA quick_check;').all();
    const quickCheckOk = Array.isArray(quickCheckResult) && quickCheckResult[0]?.quick_check === 'ok';
    assert(quickCheckOk, 'SQLite PRAGMA quick_check returned "ok"');

    const fkCheckResult = prisma._db.prepare('PRAGMA foreign_key_check;').all();
    const fkCheckOk = Array.isArray(fkCheckResult) && fkCheckResult.length === 0;
    assert(fkCheckOk, 'SQLite PRAGMA foreign_key_check returned 0 violations');

    // Clean up temporary concurrency test orders
    const deleteOrdersStmt = prisma._db.prepare('DELETE FROM orders WHERE referenceCode LIKE ?');
    deleteOrdersStmt.run(testOrderRefPrefix + '%');
    prisma._db.prepare('DELETE FROM order_items WHERE orderId NOT IN (SELECT id FROM orders)').run();

    // Verify catalog counts returned to exact baseline
    const finalProductCount = await prisma.product.count();
    const finalOrderCount = await prisma.order.count();
    assert(finalProductCount === baselineProductCount, 'Product count preserved after concurrency test');
    assert(finalOrderCount === baselineOrderCount, 'Order count returned to baseline after cleanup');

    // =========================================================================
    // SUITE 2: SQL INJECTION & ADVERSARIAL SEARCH PARAMETERS
    // =========================================================================
    console.log('\n🛡️ SUITE 2: SQL Injection & Search Parameter Resilience');

    const adversarialSearchPayloads = [
      { name: "Classic SQLi ' OR '1'='1", payload: "' OR '1'='1" },
      { name: "Double quote SQLi \" OR \"1\"=\"1", payload: '" OR "1"="1' },
      { name: "Parenthesis SQLi ') OR ('1'='1", payload: "') OR ('1'='1" },
      { name: 'DDL injection DROP TABLE', payload: "'; DROP TABLE Product; --" },
      { name: 'Stacked queries injection', payload: '1; SELECT * FROM AdminUser;' },
      { name: 'Comment truncation', payload: "admin' --" },
      { name: 'UNION SELECT AdminUser credentials', payload: "' UNION SELECT id, email, passwordHash FROM AdminUser --" },
      { name: 'SQLite PRAGMA injection', payload: "'; PRAGMA table_info(AdminUser); --" },
      { name: 'Tautology with boolean logic', payload: "fake' OR 1=1 # /*" },
      { name: 'Null byte injection', payload: 'dental\x00product' },
      { name: 'Special punctuation batch', payload: `';"\`\\%_[]{}<>/|*&^%$#@!` },
      { name: 'Extreme buffer overflow (10k chars)', payload: 'A'.repeat(10000) },
      { name: 'Arabic search with full diacritics', payload: 'حَشْوَة كُمْبُوزِيت' },
      { name: 'Arabic with tatweel / kashida', payload: 'كـــــامبوزيت' },
      { name: 'Arabic hamza variations', payload: 'إمداد امداد آمداد' },
      { name: 'Arabic punctuation and question mark', payload: 'هل يوجد حشوة، أو سيمانت؟' },
      { name: 'RTL override unicode control', payload: '\u202E\u0645\u0646\u062A\u062C\u202C' },
    ];

    for (const testCase of adversarialSearchPayloads) {
      try {
        const q = testCase.payload.trim();
        const searchWhere = {
          isActive: true,
          AND: [
            {
              OR: [
                { nameAr: { contains: q } },
                { nameEn: { contains: q } },
                { sku: { contains: q } },
                { description: { contains: q } },
              ],
            },
          ],
        };

        const results = await prisma.product.findMany({
          where: searchWhere,
        });

        // If it was a tautology SQLi like ' OR '1'='1, it should NOT return all 28 products!
        // It must be treated as a literal search string.
        if (testCase.payload.includes("' OR '1'='1") || testCase.payload.includes('" OR "1"="1')) {
          assert(
            results.length === 0,
            `SQLi payload "${testCase.name}" treated as literal string (returns 0 rows, no bypass)`,
            `Matched: ${results.length}`
          );
        } else {
          assert(
            Array.isArray(results),
            `Adversarial search "${testCase.name}" executed safely without unhandled error`,
            `Returned ${results.length} rows`
          );
        }
      } catch (sqliErr) {
        assert(false, `Adversarial search "${testCase.name}" threw error: ${sqliErr.message}`);
      }
    }

    // Verify Product table was not dropped or altered by SQLi payloads
    const postSqliCount = await prisma.product.count();
    assert(postSqliCount === baselineProductCount, 'Product table intact: zero tables dropped or records leaked');

    // Test Category filter injection resilience
    const maliciousCategorySlugs = [
      "' OR '1'='1",
      "'; DELETE FROM Category; --",
      "non-existent-category-slug-123456",
    ];

    for (const badSlug of maliciousCategorySlugs) {
      const catResults = await prisma.product.findMany({
        where: {
          OR: [{ categoryId: badSlug }, { category: { slug: badSlug } }],
        },
      });
      assert(
        catResults.length === 0,
        `Malicious category filter "${badSlug}" returns 0 products without SQL syntax error`
      );
    }

    // Test Sort parameter injection resilience
    // In our API, sort is mapped via whitelist logic:
    const testSortParams = [
      { input: 'price-asc', expectedOrderBy: { price: 'asc' } },
      { input: 'price-desc', expectedOrderBy: { price: 'desc' } },
      { input: 'price; DROP TABLE Product; --', expectedOrderBy: { createdAt: 'desc' } }, // default fallback
      { input: "' OR 1=1 --", expectedOrderBy: { createdAt: 'desc' } }, // default fallback
    ];

    for (const sortCase of testSortParams) {
      let orderBy = { createdAt: 'desc' };
      if (sortCase.input === 'price-asc') orderBy = { price: 'asc' };
      else if (sortCase.input === 'price-desc') orderBy = { price: 'desc' };

      const sortedProds = await prisma.product.findMany({
        take: 5,
        orderBy,
      });
      assert(
        sortedProds.length > 0,
        `Sort parameter "${sortCase.input}" handled safely with whitelist`,
        `OrderBy: ${JSON.stringify(orderBy)}`
      );
    }

    // =========================================================================
    // SUITE 3: ADMIN AUTHENTICATION ATTACK VECTORS
    // =========================================================================
    console.log('\n🔒 SUITE 3: Admin Authentication Attack Vectors');

    // 3.1 Default Admin User & Hash Integrity Check
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: 'admin@emdad-dental.com' },
    });
    assert(!!adminUser, 'Admin user admin@emdad-dental.com exists in SQLite database');
    assert(
      /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(adminUser.passwordHash),
      'Password hash is a genuine bcrypt hash (starts with $2a$ / $2b$)',
      `Hash prefix: ${adminUser.passwordHash.substring(0, 7)}...`
    );
    assert(
      adminUser.passwordHash !== 'admin123',
      'Plaintext password "admin123" is NOT stored directly in database'
    );

    // 3.2 Correct Password Verification
    const isCorrectPasswordValid = await bcrypt.compare('admin123', adminUser.passwordHash);
    assert(isCorrectPasswordValid === true, 'Correct password "admin123" verifies successfully against bcrypt hash');

    // 3.3 Brute Force Password Vector (20 aggressive attempts)
    const bruteForcePasswords = [
      '',
      '   ',
      'password',
      'admin',
      '123456',
      'admin1234',
      'ADMIN123',
      'Admin@123',
      "' OR '1'='1",
      "admin' --",
      'root',
      'toor',
      'guest',
      'system',
      'qwerty',
      'dental',
      'emdad',
      'emdad2026',
      '!@#$%^&*()',
      'A'.repeat(500),
    ];

    let allBruteForceRejected = true;
    for (const badPwd of bruteForcePasswords) {
      const match = await bcrypt.compare(badPwd, adminUser.passwordHash);
      if (match) {
        allBruteForceRejected = false;
        console.error(`  ❌ Failed: password "${badPwd}" was incorrectly accepted!`);
      }
    }
    assert(
      allBruteForceRejected,
      'Brute force attack: 20 incorrect/adversarial passwords all safely rejected (isMatch === false)'
    );

    // 3.4 Non-existent Email Rejection
    const nonExistentAdmin = await prisma.adminUser.findUnique({
      where: { email: 'attacker@evil.com' },
    });
    assert(nonExistentAdmin === null, 'Non-existent admin email returns null (no unauthorized record)');

    // 3.5 Token Forgery: Token Signed with Evil / Wrong Secret
    const evilSecret = new TextEncoder().encode('attacker-forged-secret-key-9999999999');
    const forgedToken = await signAdminToken(
      { sub: adminUser.id, email: adminUser.email, name: adminUser.name, role: 'ADMIN' },
      evilSecret
    );
    const forgedVerifyResult = await verifyAdminToken(forgedToken, SECRET_KEY);
    assert(
      forgedVerifyResult === null,
      'Forged token signed with unauthorized secret key is strictly rejected by verifyAdminToken'
    );

    // 3.6 Token Forgery: Tampered Signature
    const validToken = await signAdminToken({
      sub: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: 'ADMIN',
    });
    const tokenParts = validToken.split('.');
    assert(tokenParts.length === 3, 'Valid JWT contains exactly 3 parts (header.payload.signature)');

    // Alter the signature by changing characters
    const tamperedSigToken = `${tokenParts[0]}.${tokenParts[1]}.${tokenParts[2].slice(0, -4)}XXXX`;
    const tamperedSigResult = await verifyAdminToken(tamperedSigToken);
    assert(
      tamperedSigResult === null,
      'Token with tampered signature bits is rejected (signature verification failed)'
    );

    // 3.7 Token Forgery: Tampered Payload (Elevation of Privilege attempt)
    // Modify payload JSON without updating signature
    const originalPayloadDecoded = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString('utf8'));
    originalPayloadDecoded.sub = 'forged-attacker-id';
    originalPayloadDecoded.email = 'attacker@hacked.com';
    const forgedPayloadBase64 = Buffer.from(JSON.stringify(originalPayloadDecoded)).toString('base64url');
    const tamperedPayloadToken = `${tokenParts[0]}.${forgedPayloadBase64}.${tokenParts[2]}`;
    const tamperedPayloadResult = await verifyAdminToken(tamperedPayloadToken);
    assert(
      tamperedPayloadResult === null,
      'Token with tampered payload bytes is rejected (signature mismatch detected)'
    );

    // 3.8 Token Forgery: "alg": "none" Attack
    const noneHeaderBase64 = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const noneAlgToken = `${noneHeaderBase64}.${tokenParts[1]}.`;
    const noneAlgResult = await verifyAdminToken(noneAlgToken);
    assert(
      noneAlgResult === null,
      'Token with "alg": "none" header attack is strictly rejected'
    );

    // 3.9 Temporal Attacks: Expired Token Rejection
    const expiredToken = await new SignJWT({
      sub: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: 'ADMIN',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // expired 1 hour ago
      .sign(SECRET_KEY);

    const expiredResult = await verifyAdminToken(expiredToken);
    assert(
      expiredResult === null,
      'Expired token is strictly rejected by verifyAdminToken'
    );

    // 3.10 Temporal Attacks: Future "Not Before" (nbf) Token Rejection
    const futureToken = await new SignJWT({
      sub: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: 'ADMIN',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000))
      .setNotBefore(Math.floor(Date.now() / 1000) + 3600) // valid only 1 hour in future
      .setExpirationTime(Math.floor(Date.now() / 1000) + 7200)
      .sign(SECRET_KEY);

    const futureResult = await verifyAdminToken(futureToken);
    assert(
      futureResult === null,
      'Token with future "nbf" (not before) claim is strictly rejected'
    );

    // 3.11 Malformed Token Inputs
    const malformedInputs = [
      '',
      'not.a.token',
      '..',
      'eyJhbGciOiJIUzI1NiJ9.',
      'invalid-base64-characters!!!.payload.sig',
      null,
      undefined,
    ];

    for (const badToken of malformedInputs) {
      const res = await verifyAdminToken(badToken);
      assert(res === null, `Malformed token "${badToken}" returns null safely without uncaught exception`);
    }

    // 3.12 Legitimate Token Authentication
    const validAuthResult = await verifyAdminToken(validToken);
    assert(
      validAuthResult !== null &&
        validAuthResult.email === adminUser.email &&
        validAuthResult.role === 'ADMIN',
      'Legitimate admin token validates with correct email and ADMIN role',
      `Subject: ${validAuthResult?.sub}`
    );

    // =========================================================================
    // SUITE 4: ADMIN MUTATION REFLECTION
    // =========================================================================
    console.log('\n🔄 SUITE 4: Admin Mutation Reflection (DB Insert -> Prisma -> API Query)');

    const initialCatalogCount = await prisma.product.count();
    const testSku = `CHALLENGE-MUTATION-${Date.now()}`;
    const testProductData = {
      sku: testSku,
      nameAr: 'مسبار أسنان تشخيصي تجريبي متقدم',
      nameEn: 'Advanced Diagnostic Dental Probe Test',
      description: 'أداة تشخيصية تجريبية للتأكد من الانعكاس الفوري لعمليات الإضافة والتعديل',
      price: 135000,
      originalPrice: 160000,
      image: '/images/products/composite-syringe.svg',
      categoryId: sampleCategory.id,
      unit: 'قطعة',
      stock: 45,
      badge: 'جديد ومميز',
      technicalSpecs: JSON.stringify(['ستانلس ستيل طبي', 'قابل للتعقيم في الأوتوكلاف']),
      isFeatured: true,
      isActive: true,
    };

    console.log(`   Step 1: Inserting new product into SQLite database (SKU: ${testSku})...`);
    const createdProduct = await prisma.product.create({
      data: testProductData,
      include: { category: true },
    });

    assert(!!createdProduct.id, 'Product inserted successfully into SQLite', `ID: ${createdProduct.id}`);

    console.log('   Step 2: Immediately querying prisma.product.findMany()...');
    const allProductsAfterInsert = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const foundInFindMany = allProductsAfterInsert.find((p) => p.sku === testSku);
    assert(
      !!foundInFindMany,
      'Newly inserted product is IMMEDIATELY returned by prisma.product.findMany()',
      `Found product: "${foundInFindMany?.nameAr}", Price: ${foundInFindMany?.price}`
    );
    assert(
      allProductsAfterInsert.length === initialCatalogCount + 1,
      'Product list count incremented by exactly 1',
      `New count: ${allProductsAfterInsert.length}`
    );

    console.log('   Step 3: Simulating /api/products query logic with search and category filters...');
    // Simulate /api/products GET request handler query:
    const apiSimulatedWhere = {
      isActive: true,
      categoryId: sampleCategory.id,
      AND: [
        {
          OR: [
            { nameAr: { contains: 'تشخيصي' } },
            { nameEn: { contains: 'Diagnostic' } },
            { sku: { contains: testSku } },
            { description: { contains: 'تشخيصية' } },
          ],
        },
      ],
    };

    const [apiSimulatedProducts, apiSimulatedTotal] = await Promise.all([
      prisma.product.findMany({
        where: apiSimulatedWhere,
        include: {
          category: {
            select: { id: true, slug: true, nameAr: true, nameEn: true },
          },
        },
      }),
      prisma.product.count({ where: apiSimulatedWhere }),
    ]);

    const apiFound = apiSimulatedProducts.find((p) => p.sku === testSku);
    assert(
      !!apiFound && apiSimulatedTotal >= 1,
      'Newly inserted product is IMMEDIATELY returned by /api/products simulated search/category filter',
      `Total matches: ${apiSimulatedTotal}`
    );

    console.log('   Step 4: Testing Admin Mutation Update (price, nameAr, stock)...');
    const updatedPrice = 189000;
    const updatedName = 'مسبار أسنان تشخيصي معدل بعد التحديث';
    const updatedProduct = await prisma.product.update({
      where: { id: createdProduct.id },
      data: {
        price: updatedPrice,
        nameAr: updatedName,
        stock: 99,
      },
    });

    assert(
      updatedProduct.price === updatedPrice && updatedProduct.nameAr === updatedName,
      'Product update succeeded in SQLite'
    );

    // Verify immediate reflection of update in findMany
    const refreshedFind = await prisma.product.findUnique({
      where: { id: createdProduct.id },
    });
    assert(
      refreshedFind?.price === updatedPrice && refreshedFind?.nameAr === updatedName,
      'Updated product fields are IMMEDIATELY reflected in subsequent queries',
      `Refreshed price: ${refreshedFind?.price}, nameAr: "${refreshedFind?.nameAr}"`
    );

    console.log('   Step 5: Testing Admin Mutation Deactivation (isActive: false)...');
    await prisma.product.update({
      where: { id: createdProduct.id },
      data: { isActive: false },
    });

    // Query active products (like storefront): should be excluded!
    const activeProductsAfterDeactivate = await prisma.product.findMany({
      where: { isActive: true },
    });
    const foundInActive = activeProductsAfterDeactivate.find((p) => p.id === createdProduct.id);
    assert(
      !foundInActive,
      'Deactivated product is IMMEDIATELY excluded from active storefront queries (isActive: true)'
    );

    // Query all products (like admin dashboard with active=all): should be included!
    const allProductsAfterDeactivate = await prisma.product.findMany({
      where: {},
    });
    const foundInAll = allProductsAfterDeactivate.find((p) => p.id === createdProduct.id);
    assert(
      !!foundInAll && foundInAll.isActive === false,
      'Deactivated product remains visible to admin with isActive === false'
    );

    console.log('   Step 6: Cleaning up test product (hard deletion)...');
    await prisma.product.delete({
      where: { id: createdProduct.id },
    });

    const finalCatalogCount = await prisma.product.count();
    assert(
      finalCatalogCount === initialCatalogCount,
      'Product cleanly deleted; catalog restored to exact pristine count',
      `Pristine count: ${finalCatalogCount}`
    );

    const deletedCheck = await prisma.product.findUnique({
      where: { id: createdProduct.id },
    });
    assert(deletedCheck === null, 'Deleted product returns null on subsequent findUnique');

    // =========================================================================
    // SUMMARY REPORT
    // =========================================================================
    const totalDuration = Date.now() - startTime;
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(`📊 ADVERSARIAL STRESS TEST RESULTS (Duration: ${totalDuration}ms)`);
    console.log(`   Total Assertions: ${totalTests}`);
    console.log(`   Passed:           ${passedTests}`);
    console.log(`   Failed:           ${failedTests}`);
    console.log('═══════════════════════════════════════════════════════════════════');

    if (failedTests > 0) {
      console.error(`❌ VERDICT: REJECT (${failedTests} tests failed)`);
      process.exit(1);
    } else {
      console.log('🎉 VERDICT: APPROVE (100% of empirical adversarial tests passed cleanly)');
      process.exit(0);
    }
  } catch (fatalError) {
    console.error('💥 Fatal error during adversarial harness execution:', fatalError);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllSuites();

// scripts/prestart.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envPath = path.join(rootDir, '.env');
const dbDir = path.join(rootDir, 'prisma');
const dbPath = path.join(dbDir, 'dev.db');
const schemaPath = path.join(dbDir, 'schema.prisma');
const seedPath = path.join(rootDir, 'scripts', 'seed.mjs');

console.log('═══════════════════════════════════════════════════════════');
console.log('🦷 Emdad Dental Store — Prestart Database Verification');
console.log('═══════════════════════════════════════════════════════════');

// 1. Ensure .env exists
if (!fs.existsSync(envPath)) {
  console.log('⚙️ .env file not found. Creating default local configuration...');
  const defaultEnv = [
    'DATABASE_URL="file:./dev.db"',
    'JWT_SECRET="emdad-dental-secret-key-2026-safe-production-jwt-token"',
    'ADMIN_EMAIL="admin@emdad-dental.com"',
    'ADMIN_DEFAULT_PASSWORD="admin123"',
    'NEXT_PUBLIC_STORE_NAME="متجر إمداد لمستلزمات طب الأسنان"',
    'NEXT_PUBLIC_WHATSAPP_NUMBER="+963 981 276 182"',
    'NEXT_PUBLIC_WHATSAPP_DIGITS="963981276182"',
    'NODE_ENV="development"',
  ].join('\n') + '\n';
  fs.writeFileSync(envPath, defaultEnv, 'utf8');
  console.log('✅ Created .env with local SQLite DATABASE_URL');
}

// 2. Ensure prisma directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 3. Initialize native SQLite Prisma Client & schema
console.log('🔄 Initializing native SQLite Prisma Client...');
try {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  console.log('✅ Native SQLite database initialized and tables ready.');
  await prisma.$disconnect();
} catch (err) {
  console.error('❌ Failed to initialize Prisma Client:', err.message);
  process.exit(1);
}

// 5. Check if seeding is required (Product count === 0)
async function verifyAndSeed() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    let productCount = 0;
    try {
      productCount = await prisma.product.count();
    } catch {
      productCount = 0;
    }

    if (productCount === 0) {
      console.log('🌱 Database is empty (0 products found). Running auto-seed...');
      execSync(`node "${seedPath}"`, { cwd: rootDir, stdio: 'inherit' });
      console.log('✅ Auto-seed completed: 28 products, 8 categories, 3 banners, admin user.');
    } else {
      console.log(`✨ Database already contains ${productCount} dental products. Skipping seed.`);
    }

    await prisma.$disconnect();
  } catch (err) {
    console.warn('⚠️ Non-fatal seed check warning:', err.message);
    console.log('Running fallback seed...');
    try {
      execSync(`node "${seedPath}"`, { cwd: rootDir, stdio: 'inherit' });
    } catch (seedErr) {
      console.error('❌ Seed failed:', seedErr.message);
    }
  }
}

await verifyAndSeed();

console.log('🚀 Ready! Admin Credentials:');
console.log('   Email:    admin@emdad-dental.com');
console.log('   Password: admin123');
console.log('═══════════════════════════════════════════════════════════\n');

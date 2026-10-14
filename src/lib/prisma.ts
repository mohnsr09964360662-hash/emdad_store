// src/lib/prisma.ts
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// 1. Prepare serverless writable SQLite database if running on cloud environments (Netlify / Vercel / AWS Lambda)
function prepareServerlessDatabase(): string | undefined {
  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (!isServerless) {
    return process.env.DATABASE_URL;
  }

  try {
    const tmpDir = '/tmp';
    const tmpDbPath = path.join(tmpDir, 'dev.db');
    const projectDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(projectDbPath)) {
        fs.copyFileSync(projectDbPath, tmpDbPath);
        console.log('[Prisma] Successfully initialized writable SQLite database at /tmp/dev.db');
      } else {
        console.warn('[Prisma] Seed dev.db not found at', projectDbPath);
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      const fileUrl = `file:${tmpDbPath}`;
      process.env.DATABASE_URL = fileUrl;
      return fileUrl;
    }
  } catch (err) {
    console.warn('[Prisma] Failed to copy SQLite database to /tmp:', err);
  }

  return process.env.DATABASE_URL;
}

const activeDbUrl = prepareServerlessDatabase();

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: activeDbUrl
      ? {
          db: {
            url: activeDbUrl,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

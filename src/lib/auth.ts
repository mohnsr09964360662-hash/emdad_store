// src/lib/auth.ts
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export * from './auth-edge';
import { verifyAdminToken, SESSION_COOKIE_NAME, AdminSessionPayload } from './auth-edge';

// 1. Password helpers (Node.js runtime safe)
export async function hashPassword(plain: string): Promise<string> {
  const bcryptModule = await import('bcryptjs');
  const bcrypt = bcryptModule.default || bcryptModule;
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const bcryptModule = await import('bcryptjs');
  const bcrypt = bcryptModule.default || bcryptModule;
  return bcrypt.compare(plain, hash);
}

// 3. Session extraction from request or cookies
export async function getAdminSession(request?: NextRequest): Promise<AdminSessionPayload | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // In case cookies() is not accessible outside request context
      token = undefined;
    }
  }

  if (!token) return null;
  return verifyAdminToken(token);
}

// 4. Session guard helper for Route Handlers
export async function requireAdminSession(request?: NextRequest): Promise<AdminSessionPayload> {
  const session = await getAdminSession(request);
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

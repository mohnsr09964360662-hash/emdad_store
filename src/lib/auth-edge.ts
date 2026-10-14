// src/lib/auth-edge.ts
// Edge-compatible JWT helpers using jose and Web Crypto API (crypto.subtle)
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'emdad-dental-secret-key-2026-safe-production-jwt-token';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
export const SESSION_COOKIE_NAME = 'emdad_admin_session';

export interface AdminSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

// JWT signing & verification (Edge runtime safe)
export async function signAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as string) || 'ADMIN',
    };
  } catch {
    return null;
  }
}

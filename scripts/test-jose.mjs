// scripts/test-jose.mjs
import { SignJWT, jwtVerify } from '../node_modules/jose/index.js';

async function run() {
  const secret = new TextEncoder().encode('test-secret-key-for-jose-verification');
  const token = await new SignJWT({ sub: 'user-123', email: 'admin@emdad.sy', role: 'ADMIN' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  console.log('Generated token length:', token.length);
  console.log('Token parts:', token.split('.').length);

  const { payload, protectedHeader } = await jwtVerify(token, secret);
  console.log('Verified payload:', payload);
  console.log('Protected header:', protectedHeader);

  if (payload.sub !== 'user-123' || payload.role !== 'ADMIN') {
    throw new Error('Payload mismatch');
  }

  // Test expired token
  try {
    const expiredToken = await new SignJWT({ sub: 'expired' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(-10) // already expired
      .sign(secret);
    await jwtVerify(expiredToken, secret);
    throw new Error('Should have failed on expired token');
  } catch (err) {
    console.log('Expired token correctly rejected:', err.message);
  }

  // Test tampered signature
  try {
    const parts = token.split('.');
    const validBase64Tampered = parts[2].substring(0, parts[2].length - 4) + 'AAAA';
    await jwtVerify(`${parts[0]}.${parts[1]}.${validBase64Tampered}`, secret);
    throw new Error('Should have failed on tampered token');
  } catch (err) {
    console.log('Tampered token correctly rejected:', err.message);
  }

  console.log('All jose tests passed successfully!');
}

run().catch((err) => {
  console.error('Jose test failed:', err);
  process.exit(1);
});

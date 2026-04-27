import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;

  const [salt, hash] = parts;
  const hashedBuffer = Buffer.from(hash, 'hex');
  const passwordBuffer = scryptSync(password, salt, hashedBuffer.length);
  return timingSafeEqual(hashedBuffer, passwordBuffer);
}


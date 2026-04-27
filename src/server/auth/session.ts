import type { UserRole } from '@/types';

const SESSION_COOKIE_NAME = 'terraledger_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface SessionPayload {
  sub: string;
  role: UserRole;
  exp: number;
}

function assertAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = typeof atob === 'function'
    ? atob(base64 + padding)
    : Buffer.from(base64 + padding, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toBase64UrlJson(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

function fromBase64UrlJson(base64Url: string): SessionPayload | null {
  try {
    const bytes = base64UrlToBytes(base64Url);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

async function sign(data: string): Promise<string> {
  const secret = assertAuthSecret();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verify(data: string, signature: string): Promise<boolean> {
  const expected = await sign(data);
  return expected === signature;
}

export async function createSessionToken(userId: string, role: UserRole): Promise<string> {
  const payload: SessionPayload = {
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = toBase64UrlJson(payload);
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return null;

  const isValid = await verify(payloadPart, signaturePart);
  if (!isValid) return null;

  const payload = fromBase64UrlJson(payloadPart);
  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

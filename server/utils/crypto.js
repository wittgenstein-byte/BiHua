/**
 * Web Crypto API utilities for Cloudflare Workers
 * Uses native Web Crypto (SubtleCrypto) with PBKDF2 & SHA-256.
 * Zero external dependencies for maximum performance in edge isolates.
 */

const PBKDF2_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 32; // 256 bits

/**
 * Converts ArrayBuffer to Hex String
 */
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Converts Hex String to Uint8Array
 */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Generates a random cryptographic salt (16 bytes)
 */
export function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

/**
 * Generates a cryptographically random session token (32 bytes)
 */
export function generateSessionId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

/**
 * Generates UUID v4
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * Derives a PBKDF2 key from password and salt
 */
export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const saltBytes = hexToBytes(saltHex);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    HASH_KEY_LENGTH * 8
  );

  return bufferToHex(derivedBits);
}

/**
 * Constant-time password verification against stored hash
 */
export async function verifyPassword(password, saltHex, storedHashHex) {
  const calculatedHashHex = await hashPassword(password, saltHex);
  if (calculatedHashHex.length !== storedHashHex.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < calculatedHashHex.length; i++) {
    result |= calculatedHashHex.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
  }
  return result === 0;
}

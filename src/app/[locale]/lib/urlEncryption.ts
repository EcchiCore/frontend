import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// URL-safe base64 encoding and decoding helpers
function base64urlEncode(input: Buffer): string {
  return input.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remove padding
}

function base64urlDecode(input: string): Buffer {
  input = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  // Add padding if necessary
  const padding = '='.repeat((4 - input.length % 4) % 4);
  return Buffer.from(input + padding, 'base64');
}

const URL_ENCRYPTION_KEY = process.env.URL_ENCRYPTION_KEY ?? '3F1563DDD57BCEE4F7C6366996BB6';
const URL_IV_LENGTH = 12; // Using a shorter IV for URL-safe encryption
const URL_ALGORITHM = 'aes-256-gcm';

// Ensure the encryption key is exactly 32 bytes long
const keyBuffer = Buffer.from(URL_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf8');

export function encodeForUrl(str: string): string {
  const iv = randomBytes(URL_IV_LENGTH);
  const cipher = createCipheriv(URL_ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(str, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  
  // Combine IV and authTag with encrypted data using URL-safe characters
  return `${base64urlEncode(iv)}.${base64urlEncode(authTag)}.${base64urlEncode(Buffer.from(encrypted, 'base64'))}`;
}

export function decodeFromUrl(encoded: string): string | null {
  try {
    const [ivStr, authTagStr, encryptedData] = encoded.split('.');
    
    const iv = base64urlDecode(ivStr);
    const authTag = base64urlDecode(authTagStr);
    const encryptedBuffer = base64urlDecode(encryptedData);
    
    const decipher = createDecipheriv(URL_ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedBuffer, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('URL decode failed:', error);
    return null;
  }
}

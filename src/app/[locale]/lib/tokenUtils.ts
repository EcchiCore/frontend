import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? '66996BB63F1563DDD57BCEE4F7C63'; // Ensure this is 32 bytes
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-gcm';

export interface TokenData {
  timestamp: number;
  documentId: string;
}

// Ensure the encryption key is exactly 32 bytes
const keyBuffer = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf8');

export function generateToken(documentId: string): string {
  const tokenData: TokenData = {
    timestamp: Date.now(),
    documentId
  };
  
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(JSON.stringify(tokenData), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  // Combine IV, authTag, and encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function verifyToken(token: string): TokenData | null {
  try {
    const [ivHex, authTagHex, encryptedData] = token.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8'); // No need for a second final call
    
    const tokenData: TokenData = JSON.parse(decrypted);
    
    // Check if the token has expired (2 days)
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    if (Date.now() - tokenData.timestamp > TWO_DAYS) {
      return null;
    }
    
    return tokenData;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

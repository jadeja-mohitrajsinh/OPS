import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encryptionKey() {
  const encoded = process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
  if (!encoded) throw new Error('OAUTH_TOKEN_ENCRYPTION_KEY must be set to a base64-encoded 32-byte key.');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('OAUTH_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.');
  return key;
}

export function encryptJson(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64') };
}

export function decryptJson(encrypted) {
  if (!encrypted || !encrypted.iv || !encrypted.tag || !encrypted.ciphertext) {
    throw new Error('Invalid encrypted data: missing required fields (iv, tag, or ciphertext)');
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(encrypted.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(plaintext);
}

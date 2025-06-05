/**
 * Crypto utilities for password protection of markdown documents
 */

export interface EncryptionResult {
  encrypted: string;
  salt: string;
  iv: string;
}

export interface DecryptionResult {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Derives a key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data with password using AES-GCM
 */
export async function encryptWithPassword(data: string, password: string): Promise<EncryptionResult> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );
    
    // Convert to base64 strings
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    const saltBase64 = btoa(String.fromCharCode(...salt));
    const ivBase64 = btoa(String.fromCharCode(...iv));
    
    return {
      encrypted: encryptedBase64,
      salt: saltBase64,
      iv: ivBase64
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts data with password using AES-GCM
 */
export async function decryptWithPassword(
  encryptedData: string,
  salt: string,
  iv: string,
  password: string
): Promise<DecryptionResult> {
  try {
    // Convert from base64
    const encrypted = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    const saltBytes = new Uint8Array(
      atob(salt).split('').map(char => char.charCodeAt(0))
    );
    const ivBytes = new Uint8Array(
      atob(iv).split('').map(char => char.charCodeAt(0))
    );
    
    // Derive key from password
    const key = await deriveKey(password, saltBytes);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      key,
      encrypted
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    const content = decoder.decode(decrypted);
    
    return {
      content,
      success: true
    };  } catch {
    return {
      content: '',
      success: false,
      error: 'Incorrect password or corrupted data'
    };
  }
}

/**
 * Checks if the browser supports the required crypto APIs
 */
export function isCryptoSupported(): boolean {
  return !!(
    window.crypto && 
    window.crypto.subtle && 
    window.crypto.getRandomValues
  );
}

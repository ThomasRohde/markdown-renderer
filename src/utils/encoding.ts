import pako from 'pako';
import { URL_PARAM_LIMIT, URL_FRAGMENT_LIMIT, MAX_DOCUMENT_SIZE } from '../config/constants';
import { encryptWithPassword, decryptWithPassword, isCryptoSupported } from './crypto';

export interface EncodingResult {
  encoded: string;
  useFragment: boolean;
  originalSize: number;
  compressedSize: number;
  isPasswordProtected?: boolean;
}

export interface DecodingResult {
  content: string;
  success: boolean;
  error?: string;
  isPasswordProtected?: boolean;
}

export interface PasswordProtectedData {
  encrypted: string;
  salt: string;
  iv: string;
}

/**
 * Compresses and encodes markdown content for URL sharing
 */
export function encodeMarkdown(markdown: string): EncodingResult {
  if (markdown.length > MAX_DOCUMENT_SIZE) {
    throw new Error(`Document too large. Maximum size is ${MAX_DOCUMENT_SIZE} characters.`);
  }

  try {
    // Compress using gzip
    const compressed = pako.gzip(new TextEncoder().encode(markdown));
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...compressed));
    
    // Determine encoding strategy based on size
    const useFragment = base64.length > URL_PARAM_LIMIT;
    
    if (useFragment && base64.length > URL_FRAGMENT_LIMIT) {
      throw new Error(`Document too large for URL encoding. Try reducing the size.`);
    }

    return {
      encoded: base64,
      useFragment,
      originalSize: markdown.length,
      compressedSize: base64.length,
      isPasswordProtected: false
    };
  } catch (error) {
    throw new Error(`Failed to encode document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Compresses, encrypts and encodes markdown content with password protection for URL sharing
 */
export async function encodeMarkdownWithPassword(markdown: string, password: string): Promise<EncodingResult> {
  if (!isCryptoSupported()) {
    throw new Error('Password protection is not supported in this browser');
  }

  if (markdown.length > MAX_DOCUMENT_SIZE) {
    throw new Error(`Document too large. Maximum size is ${MAX_DOCUMENT_SIZE} characters.`);
  }

  try {
    // First compress the markdown
    const compressed = pako.gzip(new TextEncoder().encode(markdown));
    const compressedBase64 = btoa(String.fromCharCode(...compressed));
    
    // Then encrypt the compressed data with password
    const encrypted = await encryptWithPassword(compressedBase64, password);
    
    // Create the password-protected payload with "pw:" prefix
    const payload: PasswordProtectedData = {
      encrypted: encrypted.encrypted,
      salt: encrypted.salt,
      iv: encrypted.iv
    };
    
    const payloadJson = JSON.stringify(payload);
    const finalData = 'pw:' + btoa(payloadJson);
    
    // Determine encoding strategy based on size
    const useFragment = finalData.length > URL_PARAM_LIMIT;
    
    if (useFragment && finalData.length > URL_FRAGMENT_LIMIT) {
      throw new Error(`Document too large for URL encoding. Try reducing the size.`);
    }

    return {
      encoded: finalData,
      useFragment,
      originalSize: markdown.length,
      compressedSize: finalData.length,
      isPasswordProtected: true
    };
  } catch (error) {
    throw new Error(`Failed to encode document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decodes and decompresses markdown content from URL
 */
export function decodeMarkdown(encoded: string): DecodingResult {
  try {
    // Check if it's password protected
    if (encoded.startsWith('pw:')) {
      return {
        content: '',
        success: false,
        isPasswordProtected: true,
        error: 'This document is password protected'
      };
    }

    // Decode base64
    const binaryString = atob(encoded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Decompress using gzip
    const decompressed = pako.ungzip(bytes);
    const content = new TextDecoder().decode(decompressed);
    
    return {
      content,
      success: true,
      isPasswordProtected: false
    };
  } catch (error) {
    return {
      content: '',
      success: false,
      error: `Failed to decode document: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Decodes and decrypts password-protected markdown content from URL
 */
export async function decodeMarkdownWithPassword(encoded: string, password: string): Promise<DecodingResult> {
  if (!isCryptoSupported()) {
    return {
      content: '',
      success: false,
      error: 'Password protection is not supported in this browser'
    };
  }

  try {
    // Check if it's password protected
    if (!encoded.startsWith('pw:')) {
      return {
        content: '',
        success: false,
        error: 'This document is not password protected'
      };
    }

    // Remove "pw:" prefix and decode base64
    const payloadBase64 = encoded.substring(3);
    const payloadJson = atob(payloadBase64);
    const payload: PasswordProtectedData = JSON.parse(payloadJson);
    
    // Decrypt the compressed data
    const decryptResult = await decryptWithPassword(
      payload.encrypted,
      payload.salt,
      payload.iv,
      password
    );
    
    if (!decryptResult.success) {
      return {
        content: '',
        success: false,
        isPasswordProtected: true,
        error: decryptResult.error || 'Failed to decrypt document'
      };
    }
    
    // Decompress the decrypted data
    const compressedBytes = new Uint8Array(
      atob(decryptResult.content).split('').map(char => char.charCodeAt(0))
    );
    const decompressed = pako.ungzip(compressedBytes);
    const content = new TextDecoder().decode(decompressed);
    
    return {
      content,
      success: true,
      isPasswordProtected: true
    };
  } catch (error) {
    return {
      content: '',
      success: false,
      isPasswordProtected: true,
      error: `Failed to decode document: ${error instanceof Error ? error.message : 'Incorrect password or corrupted data'}`
    };
  }
}

/**
 * Extracts document parameter from current URL
 */
export function getDocumentFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const docParam = urlParams.get('doc');
  
  if (docParam) {
    // URL decode the parameter in case it was encoded
    try {
      return decodeURIComponent(docParam);
    } catch {
      return docParam; // Return as-is if decoding fails
    }
  }
  
  // Check fragment (hash) for larger documents
  const hash = window.location.hash;
  if (hash.startsWith('#doc=')) {
    const encoded = hash.substring(5); // Remove '#doc='
    // URL decode the fragment in case it was encoded
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded; // Return as-is if decoding fails
    }
  }
  
  return null;
}

/**
 * Updates the URL with the encoded document
 */
export function updateUrlWithDocument(encoded: string, useFragment: boolean): void {
  const baseUrl = window.location.origin + window.location.pathname;
  
  // URL encode the base64 string to ensure it's safe for URLs
  const urlSafeEncoded = encodeURIComponent(encoded);
  
  if (useFragment) {
    // Use fragment for larger documents
    window.history.replaceState({}, '', `${baseUrl}#doc=${urlSafeEncoded}`);
  } else {
    // Use query parameter for smaller documents
    window.history.replaceState({}, '', `${baseUrl}?doc=${urlSafeEncoded}`);
  }
}

import pako from 'pako';
import { URL_PARAM_LIMIT, URL_FRAGMENT_LIMIT, MAX_DOCUMENT_SIZE } from '../config/constants';

export interface EncodingResult {
  encoded: string;
  useFragment: boolean;
  originalSize: number;
  compressedSize: number;
}

export interface DecodingResult {
  content: string;
  success: boolean;
  error?: string;
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
      compressedSize: base64.length
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
      success: true
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
 * Extracts document parameter from current URL
 */
export function getDocumentFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const docParam = urlParams.get('doc');
  
  if (docParam) {
    return docParam;
  }
  
  // Check fragment (hash) for larger documents
  const hash = window.location.hash;
  if (hash.startsWith('#doc=')) {
    return hash.substring(5); // Remove '#doc='
  }
  
  return null;
}

/**
 * Updates the URL with the encoded document
 */
export function updateUrlWithDocument(encoded: string, useFragment: boolean): void {
  const baseUrl = window.location.origin + window.location.pathname;
  
  if (useFragment) {
    // Use fragment for larger documents
    window.history.replaceState({}, '', `${baseUrl}#doc=${encoded}`);
  } else {
    // Use query parameter for smaller documents
    window.history.replaceState({}, '', `${baseUrl}?doc=${encoded}`);
  }
}

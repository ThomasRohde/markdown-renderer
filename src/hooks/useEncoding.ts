import { useState, useCallback } from 'react';
import { encodeMarkdown, encodeMarkdownWithPassword, decodeMarkdown, decodeMarkdownWithPassword, getDocumentFromUrl, updateUrlWithDocument } from '../utils/encoding';
import type { EncodingResult, DecodingResult } from '../utils/encoding';

export interface UseEncodingReturn {
  encode: (markdown: string, password?: string) => Promise<EncodingResult>;
  decode: (encoded: string, password?: string) => Promise<DecodingResult>;
  getFromUrl: () => string | null;
  updateUrl: (encoded: string, useFragment: boolean) => void;
  isLoading: boolean;
  error: string | null;
}

export function useEncoding(): UseEncodingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const encode = useCallback(async (markdown: string, password?: string): Promise<EncodingResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = password 
        ? await encodeMarkdownWithPassword(markdown, password)
        : encodeMarkdown(markdown);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown encoding error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const decode = useCallback(async (encoded: string, password?: string): Promise<DecodingResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = password 
        ? await decodeMarkdownWithPassword(encoded, password)
        : decodeMarkdown(encoded);
      
      if (!result.success) {
        setError(result.error || 'Decoding failed');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown decoding error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFromUrl = useCallback(() => {
    return getDocumentFromUrl();
  }, []);

  const updateUrl = useCallback((encoded: string, useFragment: boolean) => {
    updateUrlWithDocument(encoded, useFragment);
  }, []);

  return {
    encode,
    decode,
    getFromUrl,
    updateUrl,
    isLoading,
    error
  };
}

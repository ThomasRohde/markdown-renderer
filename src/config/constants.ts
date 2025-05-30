// Base URL configuration for GitHub Pages project deployment
export const BASE_URL = import.meta.env.BASE_URL; // Will be '/markdown-renderer/'
export const FULL_URL = `https://thomasrohde.github.io/markdown-renderer/`;

// URL encoding limits
export const URL_PARAM_LIMIT = 2000;      // Safe for all browsers
export const URL_FRAGMENT_LIMIT = 50000;  // Using hash fragment
export const MAX_DOCUMENT_SIZE = 100000;  // ~100KB uncompressed

// Use for generating shareable links
export const generateShareableLink = (encoded: string): string => {
  return `${FULL_URL}?doc=${encodeURIComponent(encoded)}`;
};

export const generateFragmentLink = (encoded: string): string => {
  return `${FULL_URL}#doc=${encodeURIComponent(encoded)}`;
};

// PWA configuration
export const PWA_CONFIG = {
  name: 'Markdown Document Viewer',
  shortName: 'MD Viewer',
  description: 'View and share Markdown documents instantly',
  themeColor: '#0969da',
  backgroundColor: '#ffffff',
  version: '1.0.1' // Added version for testing updates
};

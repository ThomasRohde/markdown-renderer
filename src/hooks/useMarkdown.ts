import { useState, useCallback, useMemo } from 'react';
import { renderMarkdown, extractTitle, generateTableOfContents } from '../utils/markdown';

export interface UseMarkdownReturn {
  renderedHtml: string;
  title: string;
  tableOfContents: Array<{level: number, text: string, id: string}>;
  render: (markdown: string) => void;
  isProcessing: boolean;
}

export function useMarkdown(): UseMarkdownReturn {
  const [markdown, setMarkdown] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const render = useCallback((md: string) => {
    setIsProcessing(true);
    setMarkdown(md);
    // Use setTimeout to allow UI to update
    setTimeout(() => setIsProcessing(false), 0);
  }, []);

  const renderedHtml = useMemo(() => {
    if (!markdown) return '';
    return renderMarkdown(markdown);
  }, [markdown]);

  const title = useMemo(() => {
    if (!markdown) return 'Untitled Document';
    return extractTitle(markdown);
  }, [markdown]);

  const tableOfContents = useMemo(() => {
    if (!markdown) return [];
    return generateTableOfContents(markdown);
  }, [markdown]);

  return {
    renderedHtml,
    title,
    tableOfContents,
    render,
    isProcessing
  };
}

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked with GitHub-flavored markdown options
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Renders markdown to safe HTML
 */
export function renderMarkdown(markdown: string): string {
  try {
    // Parse markdown to HTML
    const rawHtml = marked(markdown) as string;
    
    // Sanitize HTML to prevent XSS
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'em', 'code', 'pre',
        'ul', 'ol', 'li',
        'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'a', 'img',
        'del', 'ins',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src',
        'class', 'id',
        'target', 'rel'
      ],
      ALLOW_DATA_ATTR: false
    });
    
    return cleanHtml;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return `<p>Error rendering markdown: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
  }
}

/**
 * Extracts title from markdown content (first h1 or first line)
 */
export function extractTitle(markdown: string): string {
  // Look for first h1
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Fall back to first non-empty line
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed;
    }
  }
  
  return 'Untitled Document';
}

/**
 * Generates table of contents from markdown
 */
export function generateTableOfContents(markdown: string): Array<{level: number, text: string, id: string}> {
  const toc: Array<{level: number, text: string, id: string}> = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      toc.push({ level, text, id });
    }
  }
  
  return toc;
}

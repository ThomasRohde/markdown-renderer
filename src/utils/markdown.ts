import { marked } from 'marked';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import Prism from 'prismjs';
import katex from 'katex';

// Import common language syntaxes
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
});

// Custom renderer for code blocks with syntax highlighting
const renderer = new marked.Renderer();

// Add IDs to headings for table of contents navigation
renderer.heading = function({ text, depth }: { text: string; depth: number }) {
  const id = text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  const language = lang || '';
  
  // Handle Mermaid diagrams
  if (language === 'mermaid') {
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    // Queue the diagram for rendering after DOM insertion
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        mermaid.render(`mermaid-svg-${id}`, text).then(({ svg }) => {
          element.innerHTML = svg;
        }).catch((error) => {
          console.error('Mermaid rendering failed:', error);
          element.innerHTML = `<pre class="mermaid-error"><code>${text}</code></pre>`;
        });
      }
    }, 0);
    return `<div class="mermaid-diagram" id="${id}">Loading diagram...</div>`;
  }
  
  // Apply syntax highlighting for other languages
  let highlightedCode = text;
  if (language && Prism.languages[language]) {
    try {
      highlightedCode = Prism.highlight(text, Prism.languages[language], language);
    } catch (err) {
      console.warn('Syntax highlighting failed for language:', language, err);
    }
  }
  
  return `<pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
};

// Configure marked with GitHub-flavored markdown options
marked.setOptions({
  breaks: true,
  gfm: true,
  renderer: renderer,
});

/**
 * Pre-processes markdown to protect math expressions from markdown parsing
 */
function preprocessMath(markdown: string): { processedMarkdown: string; mathStore: { [key: string]: string } } {
  // Store math expressions to protect them from markdown processing
  const localMathStore: { [key: string]: string } = {};
  let counter = 0;
  
  // Handle block math ($$...$$) first - more specific pattern
  markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const placeholder = `MATHBLOCK${counter++}`;
    localMathStore[placeholder] = math.trim();
    return `<!--MATH_${placeholder}_MATH-->`;
  });
  
  // Handle inline math ($...$) - simpler pattern
  markdown = markdown.replace(/\$([^$\r\n]+?)\$/g, (_, math) => {
    const placeholder = `MATHINLINE${counter++}`;
    localMathStore[placeholder] = math.trim();
    return `<!--MATH_${placeholder}_MATH-->`;
  });
  
  return { processedMarkdown: markdown, mathStore: localMathStore };
}

/**
 * Post-processes HTML to render math expressions using KaTeX
 */
function postprocessMath(html: string, mathStore: { [key: string]: string }): string {
  
  // Render math placeholders (both block and inline)
  html = html.replace(/<!--MATH_(MATHBLOCK\d+|MATHINLINE\d+)_MATH-->/g, (_, placeholder) => {
    const math = mathStore[placeholder];
    if (math) {
      try {
        const isBlock = placeholder.startsWith('MATHBLOCK');
        const rendered = katex.renderToString(math, {
          displayMode: isBlock,
          throwOnError: false,
        });
        if (isBlock) {
          return `<div class="math-block">${rendered}</div>`;
        } else {
          return `<span class="math-inline">${rendered}</span>`;
        }
      } catch (error) {
        console.warn('KaTeX math rendering failed:', error);
        const mathSymbol = placeholder.startsWith('MATHBLOCK') ? '$$' : '$';
        return `<span class="math-error">${mathSymbol}${math}${mathSymbol}</span>`;
      }
    }
    return `<span class="math-error">Math rendering failed</span>`;
  });
  
  return html;
}

/**
 * Renders markdown to safe HTML
 */
export function renderMarkdown(markdown: string): string {
  try {
    // Pre-process math expressions before markdown parsing
    const { processedMarkdown, mathStore: localMathStore } = preprocessMath(markdown);
    
    // Parse markdown to HTML
    const rawHtml = marked(processedMarkdown) as string;
      // Post-process to render math expressions
    const mathRendered = postprocessMath(rawHtml, localMathStore);
      // Sanitize HTML to prevent XSS
    const cleanHtml = DOMPurify.sanitize(mathRendered, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'em', 'code', 'pre',
        'ul', 'ol', 'li',
        'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'a', 'img',
        'del', 'ins',
        'div', 'span',
        // Mermaid diagram support
        'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
        'text', 'tspan', 'defs', 'marker', 'use', 'clipPath',
        // KaTeX math support - KaTeX generates span elements with specific classes
        'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'mfrac', 'msup', 'msub', 'msubsup',
        'munder', 'mover', 'munderover', 'mtable', 'mtr', 'mtd', 'mlabeledtr',
        'annotation', 'annotation-xml'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src',
        'class', 'id',
        'target', 'rel',
        // SVG attributes for Mermaid
        'viewBox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
        'cx', 'cy', 'r', 'rx', 'ry', 'points', 'fill', 'stroke', 'stroke-width',
        'stroke-dasharray', 'transform', 'd', 'marker-end', 'marker-start',
        'text-anchor', 'dominant-baseline', 'font-size', 'font-family',
        // KaTeX math attributes - KaTeX uses various attributes
        'style', 'aria-hidden', 'role', 'data-*', 'xmlns'
      ],
      ALLOW_DATA_ATTR: true,
      ADD_TAGS: ['katex', 'katex-display', 'katex-mathml'],
      ADD_ATTR: ['data-katex']
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

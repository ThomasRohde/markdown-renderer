import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useEncoding } from '../hooks/useEncoding';
import { generateShareableLink, generateFragmentLink } from '../config/constants';
import { renderMarkdown } from '../utils/markdown';

const EXAMPLE_MARKDOWN = `# Welcome to Markdown Document Viewer

This is a **Progressive Web Application** that lets you create and share Markdown documents instantly!

## Features

- 🚀 **Instant sharing** via URL encoding
- 📱 **Offline-first** PWA experience  
- 🎨 **GitHub-flavored** Markdown support
- 🔒 **Privacy-focused** - everything runs in your browser

## How to use

1. Type or paste your Markdown content below
2. Click "Generate Link" to create a shareable URL
3. Share the link with anyone!

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Lists

### Todo List
- [x] Create awesome markdown viewer
- [x] Add PWA support  
- [ ] Add more awesome features

### Shopping List
1. Markdown
2. React
3. TypeScript
4. ☕ Coffee

> **Tip:** This document itself was created using the Markdown Document Viewer!

---

Ready to create your own document? Clear this text and start writing!`;

export const Editor: React.FC = () => {
  const [content, setContent] = useState(EXAMPLE_MARKDOWN);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const { encode, error } = useEncoding();

  // Check for stored content from viewer edit action
  useEffect(() => {
    const storedContent = localStorage.getItem('editContent');
    if (storedContent) {
      setContent(storedContent);
      // Clear the stored content after using it
      localStorage.removeItem('editContent');
    }
  }, []);
  const handleGenerateLink = useCallback(async () => {
    if (!content.trim()) {
      alert('Please enter some content first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await encode(content);
      const link = result.useFragment 
        ? generateFragmentLink(result.encoded)
        : generateShareableLink(result.encoded);
      
      setGeneratedLink(link);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(link);
      
      // Navigate to the generated URL
      window.location.href = link;
      
    } catch (err) {
      console.error('Failed to generate link:', err);
      alert(error || 'Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  }, [content, encode, error]);

  const handleClear = useCallback(() => {
    setContent('');
    setGeneratedLink('');
  }, []);

  const handleLoadExample = useCallback(() => {
    setContent(EXAMPLE_MARKDOWN);
    setGeneratedLink('');
  }, []);
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Render markdown for preview mode
  const renderedHtml = useMemo(() => {
    if (!showPreview || !content.trim()) return '';
    return renderMarkdown(content);
  }, [content, showPreview]);

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
      <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              Create Document
            </h2>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {charCount} chars • {wordCount} words
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {!showPreview ? (          <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none border-0 p-4 sm:p-6 font-mono text-sm focus:ring-0 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Type your Markdown here..."
              spellCheck="false"
              autoComplete="off"
            />          ) : (
            <div className="flex-1 p-3 sm:p-6 overflow-auto">
              <div 
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={handleGenerateLink}
              disabled={isGenerating || !content.trim()}
              className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2"
            >
              {isGenerating ? 'Generating...' : 'Generate Link'}
            </button>
            <button
              onClick={handleClear}
              className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
            >
              Clear
            </button>
            <button
              onClick={handleLoadExample}
              className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
            >
              Load Example
            </button>
          </div>
          
          {generatedLink && (
            <div className="flex items-center space-x-2 justify-center sm:justify-end">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="px-2 sm:px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm w-full sm:w-64 truncate"
              />
              <button
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="btn-small text-xs sm:text-sm py-1 whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

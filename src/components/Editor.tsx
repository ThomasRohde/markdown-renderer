import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useEncoding } from '../hooks/useEncoding';
import { generateShareableLink, generateFragmentLink } from '../config/constants';
import { renderMarkdown } from '../utils/markdown';

const EXAMPLE_MARKDOWN = `# 📝 Markdown Quick Reference Guide

Welcome to the **Markdown Document Viewer**! This guide will teach you Markdown syntax while showcasing this app's features.

## What is Markdown?

Markdown is a lightweight markup language that allows you to write formatted content using plain text. It's widely used for:

- Documentation
- README files
- Forum discussions
- Note-taking
- Content management

## Basic Syntax

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

### Formatting

**Bold text** or __also bold__  
*Italic text* or _also italic_  
~~Strikethrough~~ text  
**Bold and _nested italic_** text  
***All bold and italic*** text

### Links

[Visit GitHub](https://github.com)  
[Relative link to a file](./README.md)  
<https://www.example.com> (automatic links)

### Images

![GitHub logo](https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png)  
![Local image](./public/icon-192.png)

## Lists

### Unordered Lists
- First item
- Second item
  - Indented item
  - Another indented item
- Third item

### Ordered Lists
1. First step
2. Second step
   1. Sub-step one
   2. Sub-step two
3. Third step

### Task Lists
- [x] Create markdown viewer app
- [x] Add offline support
- [x] Add syntax highlighting
- [ ] Add more features
- [ ] Get user feedback

## Code Examples

Inline code: \`const greeting = "Hello World";\`

Code block with syntax highlighting:

\`\`\`javascript
// This function greets a person by name
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Try it with different names
console.log(greet("Markdown"));
console.log(greet("World"));
\`\`\`

\`\`\`python
# Python example
def calculate_area(radius):
    """Calculate the area of a circle"""
    import math
    return math.pi * radius ** 2
    
print(f"Area of circle: {calculate_area(5):.2f}")
\`\`\`

## Tables

| Feature | Description | Support |
|---------|-------------|---------|
| Tables | Organize data | ✅ |
| Code Blocks | Show code with syntax highlighting | ✅ |
| Math | LaTeX-style math formulas | ✅ |
| Diagrams | Using Mermaid or other syntax | ⚠️ |

## Blockquotes

> Blockquotes are used to emphasize a section of quoted text.
>
> They can span multiple paragraphs.
>> And they can be nested!

## Horizontal Rules

---

## Advanced Features

Some Markdown renderers support:

### Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote text.

### Definition Lists

Term
: Definition for the term

### Math Expressions (if supported)

Inline math: $E=mc^2$

Block math:

$$
\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)
$$

---

> **Tip:** You can clear this text and start creating your own document. Click "Generate Link" when you're ready to share!`;

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
          </div>          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary text-xs sm:text-sm py-2 px-3 min-h-[36px] flex items-center justify-center"
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={handleGenerateLink}
              disabled={isGenerating || !content.trim()}
              className="btn-primary text-xs sm:text-sm py-2 px-4 min-h-[44px] flex items-center justify-center"
            >
              {isGenerating ? 'Generating...' : 'Generate Link'}
            </button>
            <button
              onClick={handleClear}
              className="btn-secondary text-xs sm:text-sm py-2 px-3 min-h-[44px] flex items-center justify-center"
            >
              Clear
            </button>
            <button
              onClick={handleLoadExample}
              className="btn-secondary text-xs sm:text-sm py-2 px-3 min-h-[44px] flex items-center justify-center"
            >
              Load Example
            </button>
          </div>
          
          {generatedLink && (            <div className="flex items-center space-x-2 justify-center sm:justify-end">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm w-full sm:w-64 truncate min-h-[36px]"
              />
              <button
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="btn-small text-xs sm:text-sm py-2 px-3 whitespace-nowrap min-h-[36px] flex items-center justify-center"
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

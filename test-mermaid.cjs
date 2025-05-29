const pako = require('pako');

function encodeMarkdownSafe(markdown) {
  try {
    // Compress using gzip
    const compressed = pako.gzip(new TextEncoder().encode(markdown));
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...compressed));
    
    // URL encode to handle special characters
    const urlSafe = encodeURIComponent(base64);
    
    return { base64, urlSafe };
  } catch (error) {
    console.error('Failed to encode:', error);
    return null;
  }
}

// Test content with mermaid diagram
const mermaidMarkdown = `# Mermaid Test

Here's a simple flowchart:

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
\`\`\`

And some regular text after the diagram.`;

console.log('='.repeat(60));
console.log('MERMAID TEST DOCUMENT');
console.log('='.repeat(60));
console.log('Content:');
console.log(mermaidMarkdown);
console.log('');

const result = encodeMarkdownSafe(mermaidMarkdown);
if (result) {
  console.log('Base64 encoded:', result.base64);
  console.log('URL safe encoded:', result.urlSafe);
  console.log('');
  
  // Test both formats
  const queryUrl = `http://localhost:5173/markdown-renderer/?doc=${result.urlSafe}`;
  const fragmentUrl = `http://localhost:5173/markdown-renderer/#doc=${result.urlSafe}`;
  
  console.log('Query Parameter URL:');
  console.log(queryUrl);
  console.log('');
  console.log('Fragment URL:');
  console.log(fragmentUrl);
  console.log('');
  
  console.log('Copy one of the URLs above and paste it in the browser to test mermaid rendering');
}

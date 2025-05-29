// Simple test script to generate URL parameters for testing
const pako = require('pako');

function encodeMarkdown(markdown) {
  try {
    // Compress using gzip
    const compressed = pako.gzip(new TextEncoder().encode(markdown));
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...compressed));
    
    return base64;
  } catch (error) {
    console.error('Failed to encode:', error);
    return null;
  }
}

// Test content
const testMarkdown = `# Test Document

This is a **test document** for URL parameter testing!

## Features
- Simple markdown
- **Bold text**
- *Italic text*

## Code Example
\`\`\`javascript
console.log("Hello, World!");
\`\`\`

> This document was loaded from URL parameters!`;

console.log('Test Markdown Content:');
console.log('====================');
console.log(testMarkdown);
console.log('\n');

const encoded = encodeMarkdown(testMarkdown);
if (encoded) {
  console.log('Encoded Base64:');
  console.log('===============');
  console.log(encoded);
  console.log('\n');
  
  const localUrl = `http://localhost:5174/markdown-renderer/?doc=${encoded}`;
  console.log('Test URL (Query Parameter):');
  console.log('===========================');
  console.log(localUrl);
  console.log('\n');
  
  const fragmentUrl = `http://localhost:5174/markdown-renderer/#doc=${encoded}`;
  console.log('Test URL (Fragment):');
  console.log('===================');
  console.log(fragmentUrl);
  console.log('\n');
  
  console.log('Instructions:');
  console.log('=============');
  console.log('1. Copy either URL above');
  console.log('2. Paste it in your browser');
  console.log('3. The test document should load automatically!');
}

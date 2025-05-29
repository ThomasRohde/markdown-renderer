const pako = require('pako');

function encodeMarkdown(markdown) {
  const compressed = pako.gzip(new TextEncoder().encode(markdown));
  return btoa(String.fromCharCode(...compressed));
}

const testMarkdown = `# Hello World

This is a **test document** loaded from URL parameters!

## Features
- Simple markdown
- URL encoding
- Compression

\`\`\`javascript
console.log("Hello from URL!");
\`\`\`

> This content was loaded from the URL parameter!`;

const encoded = encodeMarkdown(testMarkdown);
console.log('='.repeat(60));
console.log('TEST URL FOR LOCAL TESTING');
console.log('='.repeat(60));
console.log('Copy and paste this URL in your browser:');
console.log('');
console.log('http://localhost:5174/markdown-renderer/?doc=' + encoded);
console.log('');
console.log('='.repeat(60));
console.log('ALTERNATIVE FRAGMENT URL');
console.log('='.repeat(60));
console.log('http://localhost:5174/markdown-renderer/#doc=' + encoded);
console.log('');
console.log('Instructions:');
console.log('1. Copy either URL above');
console.log('2. Paste it in your browser');
console.log('3. The document should load in viewer mode');
console.log('4. You should see the "Test Document" header');
console.log('5. Try clicking "Edit" to switch to editor mode');

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

// Very simple test content
const simpleMarkdown = `# Test
Hello **world**!`;

console.log('='.repeat(60));
console.log('SIMPLE TEST DOCUMENT');
console.log('='.repeat(60));
console.log('Content:');
console.log(simpleMarkdown);
console.log('');

const result = encodeMarkdownSafe(simpleMarkdown);
if (result) {
  console.log('Base64 encoded:', result.base64);
  console.log('URL safe encoded:', result.urlSafe);
  console.log('');
  
  // Test both formats
  const queryUrl = `http://localhost:5174/markdown-renderer/?doc=${result.urlSafe}`;
  const fragmentUrl = `http://localhost:5174/markdown-renderer/#doc=${result.urlSafe}`;
  
  console.log('Query Parameter URL:');
  console.log(queryUrl);
  console.log('');
  console.log('Fragment URL:');
  console.log(fragmentUrl);
  console.log('');
  
  // Also test direct base64 (without URL encoding)
  const directQuery = `http://localhost:5174/markdown-renderer/?doc=${result.base64}`;
  console.log('Direct Base64 URL:');
  console.log(directQuery);
  console.log('');
  
  console.log('Try each URL above - one should work!');
}

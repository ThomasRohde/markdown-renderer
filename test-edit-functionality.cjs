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

// Test content with various markdown elements to verify edit functionality
const testMarkdown = `# Edit Functionality Test

This document is designed to test the **edit functionality** of the Markdown Document Viewer.

## Features to Test

When you click the "Edit" button in the viewer:

1. ✅ **Content Preservation**: This exact text should appear in the editor
2. ✅ **Formatting Retention**: All **bold**, *italic*, and other formatting should be preserved
3. ✅ **Code Blocks**: The following code should remain intact:

\`\`\`javascript
function testEdit() {
  console.log("Edit functionality is working!");
  return "success";
}
\`\`\`

## Lists Should Work

- First item
- Second item with **bold text**
- Third item with *italic text*

### Numbered Lists Too

1. Item one
2. Item two
3. Item three

## Blockquotes

> This blockquote should also be preserved when editing.
> 
> Multiple lines should work as well.

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Content preservation | ✅ | Should work |
| Formatting retention | ✅ | Should work |
| Code blocks | ✅ | Should work |

---

**Test Instructions:**
1. View this document in the viewer
2. Click the "M" icon to reveal controls
3. Click "Edit" button
4. Verify ALL content above appears in the editor (not the default example)
5. The editor should show this exact content, ready for editing

If you see the default "Welcome to Markdown Document Viewer" text instead, the bug is still present.
If you see this content, the fix is working! 🎉`;

console.log('='.repeat(80));
console.log('EDIT FUNCTIONALITY TEST DOCUMENT');
console.log('='.repeat(80));
console.log('📝 Content preview:');
console.log(testMarkdown.substring(0, 200) + '...');
console.log('');

const result = encodeMarkdownSafe(testMarkdown);
if (result) {
  console.log('🔗 Test URL:');
  const testUrl = `http://localhost:5173/markdown-renderer/?doc=${result.urlSafe}`;
  console.log(testUrl);
  console.log('');
  console.log('🧪 Test Steps:');
  console.log('1. Open the URL above');
  console.log('2. Read the document in viewer mode');
  console.log('3. Click the "M" icon (upper right corner)');
  console.log('4. Click "Edit" button');
  console.log('5. Verify the editor shows THIS content (not default example)');
  console.log('');
  console.log('✅ Expected Result: Editor should show the test content above');
  console.log('❌ Bug Present: Editor shows "Welcome to Markdown Document Viewer" default text');
  console.log('='.repeat(80));
} else {
  console.log('❌ Failed to encode test document');
}

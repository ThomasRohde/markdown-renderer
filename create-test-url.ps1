# PowerShell script to generate test URLs
# Usage: .\create-test-url.ps1

# Install pako if needed: npm install pako

$markdown = @"
# My Test Document

This is a **test document** created via PowerShell!

## Features
- Custom content
- URL encoding
- Compression

```javascript
console.log("Hello from PowerShell!");
```
"@

Write-Host "Creating test URL for content:" -ForegroundColor Green
Write-Host $markdown
Write-Host ""

# You can run this with node
$nodeScript = @"
const pako = require('pako');
const markdown = `$($markdown -replace '`', '\`')`;
const compressed = pako.gzip(new TextEncoder().encode(markdown));
const base64 = btoa(String.fromCharCode(...compressed));
const urlSafe = encodeURIComponent(base64);
console.log('Test URL:');
console.log('http://localhost:5174/markdown-renderer/?doc=' + urlSafe);
"@

$nodeScript | Out-File -FilePath "temp-url-gen.cjs" -Encoding UTF8
node temp-url-gen.cjs
Remove-Item "temp-url-gen.cjs"

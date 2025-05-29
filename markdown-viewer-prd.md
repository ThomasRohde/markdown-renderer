# Product Requirements Document: Markdown Document Viewer

**Project Name:** Markdown Document Viewer  
**Repository:** thomasrohde.github.io/markdown-renderer  
**Version:** 1.0.0  
**Last Updated:** May 2025  

## 1. Executive Summary

The Markdown Document Viewer is an offline-first Progressive Web Application (PWA) that enables users to create, share, and view Markdown documents through URL parameters. The application requires no backend infrastructure and operates entirely in the browser, making it ideal for GitHub Pages deployment. As a PWA, it can be installed on any device and works fully offline.

### Key Features
- Instant Markdown document sharing via URL
- Full offline functionality with service worker caching
- Installable as a native-like app on any platform
- QR code generation for easy mobile sharing
- Support for extended Markdown features including Mermaid diagrams
- Document history stored locally in IndexedDB
- Zero backend requirements - fully static deployment
- Responsive design for mobile and desktop viewing
- Privacy-focused: all processing happens client-side

## 2. User Stories

### As a Technical Writer
- I want to quickly share formatted documentation without setting up a server
- I want my diagrams (Mermaid, PlantUML) to render properly
- I want syntax highlighting for code blocks
- I want to access my documents offline after viewing them once

### As a Developer
- I want to share code snippets with proper formatting
- I want to embed technical diagrams in my documentation
- I want the shared links to work permanently
- I want to install the app on my device for quick access

### As a Student/Teacher
- I want to share notes and educational content easily
- I want mathematical formulas to display correctly
- I want a clean, distraction-free reading experience
- I want to view documents offline during classes

### As a Mobile User
- I want to install the app from my browser
- I want to share documents via QR code
- I want the app to work offline on my phone
- I want a responsive, touch-friendly interface

## 3. Functional Requirements

### 3.1 Landing Page (No URL Parameters)

**Editor Interface:**
- Large textarea for Markdown input with monospace font
- Live character/word count display
- Syntax highlighting (optional enhancement)
- Clear placeholder text with Markdown examples

**Actions:**
- "Generate Link" button (primary action)
- "Preview" toggle to see rendered output
- "Clear" button to reset content
- "Load Example" button with sample content

**Feedback:**
- Success notification when link is generated
- Copy-to-clipboard functionality
- Warning if content is too large for URL encoding
- Automatic fallback to fragment (#) encoding for larger documents

### 3.2 Viewer Mode (With URL Parameters)

**Document Display:**
- Rendered Markdown with GitHub-flavored styling
- Responsive typography optimized for reading
- Table of contents for documents with headers
- Smooth scrolling to anchor links

**Viewer Actions:**
- "Copy Link" button
- "Share via QR" button (generates QR code modal)
- "View Source" toggle to see raw Markdown
- "Edit" button to return to editor with content loaded
- "Download" options (Markdown, HTML, PDF)
- "Theme Toggle" (light/dark mode)
- "Install App" button (when not installed)
- "Add to Favorites" button (stored in IndexedDB)

### 3.3 Supported Markdown Features

**Core Markdown:**
- Headers (h1-h6)
- Bold, italic, strikethrough
- Ordered and unordered lists
- Links and images
- Code blocks with syntax highlighting
- Tables
- Blockquotes
- Horizontal rules

**Extended Features:**
- Mermaid diagrams
- PlantUML diagrams (if size permits)
- Mathematical expressions (KaTeX)
- Task lists
- Footnotes
- Emoji support :smile:
- HTML sanitization for security

### 3.4 PWA & Offline Features

**Progressive Web App:**
- Install prompt for adding to home screen
- Offline viewing of previously loaded documents
- Document history stored in IndexedDB
- Background sync for analytics (privacy-preserving)
- App-like experience on mobile devices

**Offline Capabilities:**
- Service worker caching strategies:
  - Cache-first for assets
  - Network-first for document data
  - Stale-while-revalidate for API calls
- Offline indicator in UI
- Queue failed operations for retry

**Sharing Features:**
- QR code generation for document URLs
- Native share API integration
- Copy link with one click
- Short URL generation (using fragment encoding)

### 3.5 Document Management

**Local Storage (IndexedDB):**
- Recent documents history (last 50)
- Favorite documents
- Document metadata (title, created date, size)
- Automatic cleanup of old entries

**Import/Export:**
- Import from .md files
- Export to .md, .html, .pdf
- Batch operations support
- Drag-and-drop file upload

## 4. Technical Requirements

### 4.1 Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  URL Parameter  │────▶│  Decompression   │────▶│  Markdown       │
│  Parsing        │     │  (pako/fflate)   │     │  Rendering      │
│                 │     │                  │     │  (marked.js)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### 4.2 Technology Stack

**Frontend Framework:**
- React 18.x with TypeScript
- Vite for build tooling
- NO React Router (single page app, using URL params only)

**Core Libraries:**
- marked.js - Markdown parsing
- pako or fflate - Compression/decompression
- Prism.js - Syntax highlighting
- Mermaid - Diagram rendering
- KaTeX - Math rendering
- DOMPurify - HTML sanitization
- qrcode - QR code generation for sharing
- idb - IndexedDB wrapper for offline storage

**PWA Libraries:**
- vite-plugin-pwa - PWA generation and service worker
- workbox - Service worker utilities (via vite-plugin-pwa)

**Styling:**
- Tailwind CSS v4 for utility styling
- GitHub Markdown CSS for document styling
- CSS-in-JS for dynamic theming

**Development Dependencies:**
- gh-pages - GitHub Pages deployment
- @lhci/cli - Lighthouse CI for PWA auditing
- canvas - Icon generation

**Important:** Since this is a GitHub Pages project deployment, we must handle the base path `/markdown-renderer/` in all asset references and avoid client-side routing.

### 4.3 URL Encoding Strategy

```typescript
interface EncodingStrategy {
  compress(markdown: string): Uint8Array;
  encode(compressed: Uint8Array): string;
  decode(encoded: string): Uint8Array;
  decompress(compressed: Uint8Array): string;
}

// Size thresholds
const URL_PARAM_LIMIT = 2000;      // Safe for all browsers
const URL_FRAGMENT_LIMIT = 50000;  // Using hash fragment
const MAX_DOCUMENT_SIZE = 100000;  // ~100KB uncompressed
```

**Encoding Flow:**
1. Compress Markdown text using pako (gzip)
2. Convert to base64 string
3. If size < 2000 chars: use `?doc=<encoded>`
4. If size < 50000 chars: use `#doc=<encoded>`
5. If larger: show error with alternatives

### 4.4 Security Requirements

- All user input must be sanitized before rendering
- No execution of arbitrary JavaScript from Markdown
- Content Security Policy headers for GitHub Pages
- HTTPS only (enforced by GitHub Pages)
- No external resource loading without user consent

### 4.5 PWA Configuration

**Service Worker Strategy:**
```typescript
// vite.config.ts PWA configuration
pwa: {
  registerType: 'prompt',
  scope: '/markdown-renderer/',
  base: '/markdown-renderer/',
  manifest: {
    id: 'markdown-renderer',
    name: 'Markdown Document Viewer',
    short_name: 'MD Viewer',
    description: 'View and share Markdown documents instantly',
    theme_color: '#0969da',
    start_url: '/markdown-renderer/',
    scope: '/markdown-renderer/',
    display: 'standalone',
    icons: [] // Generated by build script
  },
  workbox: {
    navigateFallback: '/markdown-renderer/index.html',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/thomasrohde\.github\.io\/markdown-renderer\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'app-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      }
    ]
  }
}
```

**IndexedDB Schema:**
```typescript
// utils/storage.ts
interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  compressed: string;
  createdAt: Date;
  lastViewedAt: Date;
  isFavorite: boolean;
  size: number;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  editorSettings: object;
}
```

**Icon Generation Script:**
```javascript
// scripts/generate-icons.js
const canvas = require('canvas');
const fs = require('fs');

const sizes = [192, 512];
const colors = { bg: '#0969da', fg: '#ffffff' };

sizes.forEach(size => {
  const cvs = canvas.createCanvas(size, size);
  const ctx = cvs.getContext('2d');
  
  // Draw icon (M for Markdown)
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = colors.fg;
  ctx.font = `${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', size / 2, size / 2);
  
  fs.writeFileSync(
    `public/icon-${size}.png`,
    cvs.toBuffer('image/png')
  );
});
```

## 5. User Interface Specifications

### 5.1 GitHub Pages Project Considerations

Since this is deployed as a GitHub Pages **project** (not a user/organization page), special attention must be paid to:

1. **Base Path Handling**: All URLs will be under `/markdown-renderer/`
2. **No Client-Side Routing**: Use URL parameters for state management
3. **404 Handling**: GitHub Pages will serve 404.html for unknown paths
4. **Asset Paths**: Must be relative or include base path

```typescript
// App.tsx - Handling base path
const App: React.FC = () => {
  const isEditor = !window.location.search && !window.location.hash;
  
  return (
    <div className="min-h-screen">
      <Header basePath="/markdown-renderer/" />
      {isEditor ? <Editor /> : <Viewer />}
    </div>
  );
};
```

### 5.2 Layout Structure

```
┌──────────────────────────────────────┐
│ Header                               │
│ ┌──────────────┬─────────────────┐  │
│ │    Logo      │   Actions       │  │
│ └──────────────┴─────────────────┘  │
├──────────────────────────────────────┤
│ Main Content Area                    │
│ ┌──────────────────────────────────┐│
│ │                                  ││
│ │   Editor / Viewer               ││
│ │                                  ││
│ └──────────────────────────────────┘│
├──────────────────────────────────────┤
│ Footer (minimal)                     │
└──────────────────────────────────────┘
```

### 5.2 Design System

**Colors:**
- Light theme: GitHub-inspired palette
- Dark theme: VS Code-inspired palette
- Accent color: #0969da (GitHub blue)

**Typography:**
- Editor: 'SF Mono', 'Monaco', 'Inconsolata', monospace
- Viewer: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Base size: 16px with responsive scaling

**Spacing:**
- Use Tailwind's spacing scale
- Consistent 8px grid system
- Generous whitespace for readability

### 5.3 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 6. Implementation Plan

### Phase 1: Core Functionality (Week 1)
- [X] Project setup with Vite + React + TypeScript + PWA
- [X] Basic Markdown editor component
- [X] URL parameter encoding/decoding
- [X] Basic Markdown rendering
- [X] PWA manifest and service worker setup
- [X] Deploy to GitHub Pages

### Phase 2: Enhanced Features (Week 2)
- [ ] Mermaid diagram support
- [ ] Syntax highlighting
- [ ] Table of contents generation
- [ ] Dark mode toggle
- [ ] Mobile responsive design
- [ ] IndexedDB integration for history
- [ ] QR code generation for sharing
- [ ] Install PWA prompt

### Phase 3: Polish & Optimization (Week 3)
- [ ] Download functionality
- [ ] Example documents
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Lighthouse CI integration
- [ ] Offline mode testing
- [ ] Icon generation automation

## 7. Performance Requirements

- Initial load time: < 3 seconds on 3G
- Time to interactive: < 1 second
- Markdown rendering: < 100ms for 10KB document
- Bundle size: < 200KB gzipped
- **PWA Requirements:**
  - Lighthouse PWA score: 100/100
  - Offline functionality: Full app usable offline
  - Install prompt: Shows after 30 seconds of engagement
  - Service worker activation: < 2 seconds
- Lighthouse scores:
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 95
  - SEO: > 90
  - PWA: 100 (required)

### Offline-First Architecture
- Cache all app assets on first visit
- Store last 50 viewed documents in IndexedDB
- Queue any failed operations for retry
- Show clear offline/online status
- Graceful degradation for features requiring network

## 8. Testing Strategy

### Unit Tests
- Encoding/decoding functions
- Markdown parsing edge cases
- URL parameter handling
- Sanitization effectiveness

### Integration Tests
- Full document flow (create → share → view)
- Large document handling
- Special character encoding
- Browser compatibility

### E2E Tests
- User journey scenarios
- Link sharing workflow
- Performance under load

## 9. Deployment Configuration

### GitHub Pages Setup (PROJECT Page)

**Important Considerations for Project Pages:**
- URL structure: `https://thomasrohde.github.io/markdown-renderer/`
- Base path must be configured in all build tools
- All assets must use relative paths or include base path
- No client-side routing (single HTML file)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@latest
      - uses: actions/setup-node@latest
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      
      # PWA audit before deployment
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: './lighthouserc.js'
          uploadArtifacts: true
          temporaryPublicStorage: true
      
      - uses: peaceiris/actions-gh-pages@latest
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "node scripts/generate-icons.js && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",
    "test": "vitest",
    "test:pwa": "lhci autorun",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "homepage": "https://thomasrohde.github.io/markdown-renderer/"
}
```

### Build Configuration

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      base: '/markdown-renderer/',
      scope: '/markdown-renderer/',
      manifest: {
        id: 'markdown-renderer',
        name: 'Markdown Document Viewer',
        short_name: 'MD Viewer',
        start_url: '/markdown-renderer/',
        scope: '/markdown-renderer/',
        display: 'standalone',
        theme_color: '#0969da',
        background_color: '#ffffff'
      },
      workbox: {
        navigateFallback: '/markdown-renderer/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
      }
    })
  ],
  base: '/markdown-renderer/', // CRITICAL for project pages
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    // Single page app - no need for multiple HTML files
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: {
          'markdown': ['marked', 'dompurify'],
          'diagrams': ['mermaid'],
          'compression': ['pako']
        }
      }
    }
  }
});
```

### Lighthouse CI Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/markdown-renderer/'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:pwa': ['error', { minScore: 1 }],
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### Environment Configuration

```typescript
// src/config/constants.ts
export const BASE_URL = import.meta.env.BASE_URL; // Will be '/markdown-renderer/'
export const FULL_URL = `https://thomasrohde.github.io/markdown-renderer/`;

// Use for generating shareable links
export const generateShareableLink = (encoded: string): string => {
  return `${FULL_URL}?doc=${encoded}`;
};
```

### Asset Handling

```typescript
// Always use base-aware asset imports
import logo from './assets/logo.svg'; // Vite handles base path

// For dynamic assets
const getAssetUrl = (path: string) => {
  return new URL(path, import.meta.url).href;
};
```

## 10. Future Enhancements

### Version 1.1
- Real-time collaboration via WebRTC
- Custom CSS themes beyond light/dark
- Export to various formats (DOCX, LaTeX)
- Browser extension for quick sharing
- Enhanced offline sync with conflict resolution

### Version 1.2
- Integration with GitHub Gists for large documents
- Advanced version history with diff viewing
- Markdown templates library
- API for programmatic document creation
- Workspaces for organizing documents

### Version 2.0
- Plugin system for custom renderers
- WYSIWYG editing mode
- Integration with popular note-taking apps
- Analytics dashboard (privacy-preserving)
- Multi-language support
- Collaborative editing with presence indicators

## 11. Success Metrics

- User engagement: Average session duration > 2 minutes
- Document creation: > 100 documents/day after launch
- Performance: 95th percentile load time < 2 seconds
- Reliability: 99.9% successful document loads
- User satisfaction: > 4.5/5 star rating
- **PWA Metrics:**
  - Install rate: > 10% of regular users
  - Offline usage: > 20% of sessions
  - Return rate: > 40% weekly active users
  - Lighthouse PWA score: 100/100 maintained
  - Zero console errors in production

## Success Criteria

**Deployment Success:**
- ✅ Fully offline-capable PWA
- ✅ Zero console errors
- ✅ Automatic GitHub Pages deployment
- ✅ PWA installs correctly on all platforms
- ✅ Service worker updates properly
- ✅ No conflicts with other PWAs (unique scope)
- ✅ All Lighthouse audits pass (PWA score = 100)

## 12. Risk Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|-------------------|
| URL length limitations | High | Implement progressive encoding strategies |
| Browser compatibility | Medium | Test on all major browsers, provide fallbacks |
| Performance on mobile | Medium | Lazy load heavy libraries, optimize bundle |
| Security vulnerabilities | High | Regular dependency updates, strict CSP |
| GitHub Pages limitations | Low | Design within constraints, no server requirements |

## 13. Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators
- Proper ARIA labels
- Semantic HTML structure

## 14. Monitoring & Analytics

- Google Analytics 4 (privacy-friendly configuration)
- Error tracking with Sentry
- Performance monitoring with Web Vitals
- Custom events for feature usage
- No personal data collection

## Appendix A: Example URL Structures

```
# Small document (< 2KB)
https://thomasrohde.github.io/markdown-renderer/?doc=H4sIAAAAAAAAA8tIzcnJVyjPL8pJUQQAQmcJFQwAAAA%3D

# Medium document (< 50KB)  
https://thomasrohde.github.io/markdown-renderer/#doc=H4sIAAAAAAAAA8tIzcnJ...

# Error state (document too large)
https://thomasrohde.github.io/markdown-renderer/?error=document_too_large

# Landing page (no parameters)
https://thomasrohde.github.io/markdown-renderer/
```

### Important Notes for Project Pages:
- All URLs must include the `/markdown-renderer/` path
- The app is served from a subdirectory, not the root domain
- Base path configuration is critical for assets to load correctly
- Use `import.meta.env.BASE_URL` for dynamic path construction

## Appendix B: Sample Code Structure

```
markdown-renderer/
├── src/
│   ├── components/
│   │   ├── Editor.tsx
│   │   ├── Viewer.tsx
│   │   ├── Header.tsx
│   │   ├── InstallPrompt.tsx   // PWA install
│   │   ├── QRCodeModal.tsx     // QR sharing
│   │   └── common/
│   ├── hooks/
│   │   ├── useMarkdown.ts
│   │   ├── useTheme.ts
│   │   ├── useEncoding.ts
│   │   ├── usePWA.ts           // PWA hooks
│   │   └── useOffline.ts       // Offline detection
│   ├── utils/
│   │   ├── encoding.ts
│   │   ├── markdown.ts
│   │   ├── storage.ts          // IndexedDB wrapper
│   │   ├── syncQueue.ts        // Background sync
│   │   └── qrcode.ts           // QR generation
│   ├── config/
│   │   └── constants.ts        // BASE_URL configuration
│   ├── styles/
│   │   ├── index.css           // Tailwind v4 imports
│   │   ├── markdown.css
│   │   └── themes.css
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── 404.html               // Copy of index.html for GitHub Pages
│   ├── .nojekyll              // Bypass Jekyll processing
│   └── examples/
├── scripts/
│   └── generate-icons.js      // PWA icon generation
├── tests/
├── .github/
│   └── workflows/
│       └── deploy.yml         // GitHub Actions with Lighthouse
├── index.html                 // Entry point with base path
├── package.json
├── vite.config.ts             // PWA and base path config
├── lighthouserc.js            // Lighthouse CI config
├── tailwind.config.js         // Tailwind v4 config
├── postcss.config.js
├── tsconfig.json
└── README.md
```

### Critical Files for GitHub Pages Project Deployment:

**index.html** - Must handle base path and PWA:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/markdown-renderer/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0969da" />
    <link rel="manifest" href="/markdown-renderer/manifest.webmanifest" />
    <title>Markdown Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**404.html** - Required for GitHub Pages SPA:
```html
<!-- public/404.html - Copy of index.html -->
<!-- GitHub Pages serves this for any unknown routes -->
```

**.nojekyll** - Prevents GitHub Pages from processing files:
```
<!-- public/.nojekyll - Empty file -->
```

## Appendix C: Initial Setup Commands

```bash
# Create the project
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm i pako marked dompurify prismjs mermaid katex qrcode idb

# Install PWA and build dependencies
npm i -D vite-plugin-pwa workbox-window gh-pages canvas @lhci/cli

# Install Tailwind CSS v4
npm i -D tailwindcss@4 postcss autoprefixer

# Install type definitions
npm i -D @types/marked @types/dompurify @types/prismjs @types/katex

# Initialize Tailwind
npx tailwindcss init -p

# Create necessary directories
mkdir -p src/components src/hooks src/utils src/config src/styles scripts
mkdir -p public/examples .github/workflows

# Create critical files
touch public/.nojekyll
touch scripts/generate-icons.js
touch lighthouserc.js
```

### Tailwind v4 Configuration

```css
/* src/index.css */
@import "tailwindcss";
```

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

**Document Status:** Ready for Development  
**Approval:** Pending  
**Next Steps:** Technical design review and development kickoff
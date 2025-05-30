---
mode: agent
description: Generate an offline-first React + TS PWA deployable to GitHub Pages
tools: [workspaceTerminal, githubRepo, codebase, terminalLastCommand]
---

## Inputs (ask once if missing)
- appIdea  – PWA description  
- repoName – defaults ${workspaceFolderBasename}  
- githubUser – GitHub user  
- appDisplayName – human-readable app name
- appDescription – detailed app description for manifest
- themeColor – primary brand color (default: '#0969da')

## Workflow
1. **Plan** – create / update `TODO.md` (phases; done / doing / next).

2. **Scaffold** –  
   ```bash
   npm create vite@latest . -- --template react-ts
   npm i idb qrcode lucide-react
   npm i -D vite-plugin-pwa @tailwindcss/vite canvas gh-pages @lhci/cli eslint vitest
   ```

3. **Configure Base Setup**
   * `vite.config.ts` – Complete PWA configuration with proper caching strategy
     * `base`, `scope`, `start_url`: `/${repoName}/`
     * `registerType: 'prompt'`, proper `navigateFallback` and deny list
     * Runtime caching for GitHub Pages domains
     * Icon paths with proper base URL
   * `package.json` – Add all necessary scripts including icon generation, testing, linting
     * `homepage` field for GitHub Pages
     * Proper build script that runs icon generation first
   * Remove default Vite CSS, set up clean `src/index.css`

4. **Tailwind CSS v4 Setup**
   * Add `@import "tailwindcss";` to `src/index.css` (not index.css)
   * Create `tailwind.config.js` with proper content paths and dark mode class
   * Add `postcss.config.js` (required for Tailwind v4)
   * Include common utility classes and mobile-optimized defaults

5. **Project Architecture**
   * Folders: `components/`, `hooks/`, `utils/`, `config/`, `styles/`
   * `src/config/constants.ts` – centralized configuration
   * `src/types/` – shared TypeScript interfaces
   * Component structure optimized for PWA patterns

6. **PWA Infrastructure**
   * `scripts/generate-icons.js` – Canvas-based icon generation with proper error handling
   * PWA manifest with complete metadata (id, scope, display, orientation)
   * Service worker registration with update prompts
   * Offline detection and user feedback
   * Install prompts for supported platforms

7. **Storage & Offline**
   * `utils/storage.ts` – IndexedDB wrapper with error handling
   * Local storage fallback for critical data
   * Offline state management
   * Data synchronization patterns

8. **Mobile Optimization**
   * Viewport meta tags for iOS Safari
   * Touch gesture handling
   * Pull-to-refresh functionality
   * iOS-specific PWA considerations
   * Responsive design patterns

9. **CI/CD & Deployment**
   * `.github/workflows/deploy.yml` – Modern GitHub Actions with:
     * Node.js 20, proper caching
     * Build + Lighthouse CI integration
     * GitHub Pages deployment with proper permissions
   * `public/.nojekyll` for GitHub Pages
   * `lighthouserc.js` with comprehensive PWA scoring

10. **Quality & Testing**
    * ESLint configuration for React + TypeScript
    * Lighthouse CI with PWA score enforcement (min 1.0)
    * Performance, accessibility, and SEO checks
    * PWA testing utilities and validation scripts

11. **Essential Features**
    * Theme switching (dark/light) with system preference detection
    * QR code generation utility
    * Error boundaries and graceful degradation
    * Loading states and skeleton screens
    * Proper ARIA labels and accessibility

12. **Validation & Checks**
    * `npm run dev` starts cleanly with no console errors
    * PWA installs correctly on desktop and mobile
    * Offline functionality works completely
    * `npm run build && npm run preview` works perfectly
    * All Lighthouse PWA criteria pass (score 100)
    * GitHub Pages deployment succeeds at `https://${githubUser}.github.io/${repoName}/`
    * Multiple PWAs can coexist (unique manifest IDs and scopes)

13. **Post-Setup Verification**
    * Test installation on Chrome Desktop, iOS Safari, Android Chrome
    * Verify offline functionality across different scenarios
    * Check service worker updates and user prompts
    * Validate responsive design on various screen sizes
    * Ensure no console errors or warnings

## Key Configuration Templates

### vite.config.ts Template
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      base: '/${repoName}/',
      scope: '/${repoName}/',
      manifest: {
        id: '${repoName}',
        name: '${appDisplayName}',
        short_name: '${appDisplayName}',
        description: '${appDescription}',
        theme_color: '${themeColor}',
        background_color: '#ffffff',
        start_url: '/${repoName}/',
        scope: '/${repoName}/',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/${repoName}/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/${repoName}/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/${repoName}/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/${githubUser}\.github\.io\/${repoName}\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  base: '/${repoName}/'
})
```

### package.json Scripts Template
```json
{
  "scripts": {
    "dev": "vite",
    "build": "node scripts/generate-icons.js && tsc -b && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",
    "test": "vitest",
    "test:pwa": "lhci autorun",
    "lint": "eslint ."
  },
  "homepage": "https://${githubUser}.github.io/${repoName}/"
}
```

### lighthouserc.js Template
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/${repoName}/'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:pwa': ['error', { minScore: 1 }],
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Success Criteria:**
- ✅ 100% PWA Lighthouse score
- ✅ Full offline functionality
- ✅ Zero console errors/warnings
- ✅ Automatic GitHub Pages deployment
- ✅ Mobile-optimized experience
- ✅ Proper service worker caching
- ✅ Theme switching works
- ✅ Install prompts appear correctly
- ✅ App works on iOS Safari, Chrome, Firefox

**Common Gotchas Addressed:**
- Proper base URL configuration for GitHub Pages
- iOS Safari PWA quirks and viewport handling
- Service worker scope and navigation fallback issues
- Tailwind CSS v4 setup with Vite
- Icon generation with proper dimensions and formats
- Lighthouse CI integration in GitHub Actions
- ESLint configuration conflicts
- Package.json script ordering for builds
- Missing dependencies that cause build failures
- PWA manifest validation requirements
- Service worker registration timing
- Mobile viewport and touch handling

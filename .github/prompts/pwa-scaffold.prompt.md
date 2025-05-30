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
   npm i -D vite-plugin-pwa @tailwindcss/vite canvas gh-pages eslint vitest
   ```

3. **Configure Base Setup**
   * `vite.config.ts` – Complete PWA configuration with proper caching strategy
     * Import `tailwindcss from '@tailwindcss/vite'` (not postcss)
     * `base`, `scope`, `start_url`: `/${repoName}/`
     * `registerType: 'prompt'`, proper `navigateFallback` and deny list
     * Runtime caching for GitHub Pages domains
     * Icon paths with proper base URL
   * `package.json` – Add all necessary scripts including icon generation, testing, linting
     * `homepage` field for GitHub Pages
     * Proper build script that runs icon generation first
   * Remove default Vite CSS, set up clean `src/index.css` starting with `@import "tailwindcss";`

4. **Tailwind CSS v4 Setup**
   * Install: `npm i -D @tailwindcss/vite` (v4 Vite plugin)
   * Add `@import "tailwindcss";` to `src/index.css` (first line)
   * Create `tailwind.config.js` with proper content paths and dark mode class
   * Add `postcss.config.js` (minimal config since using Vite plugin)
   * Include comprehensive mobile-first utility classes and iOS optimizations
   * Set up standardized button system and touch-friendly interactions

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
   * Viewport meta tags for iOS Safari: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
   * Touch gesture handling with `touch-action: manipulation`
   * Pull-to-refresh functionality with proper iOS behavior
   * iOS-specific PWA considerations (safe areas, notch support)
   * Responsive design patterns with mobile-first approach
   * iOS touch targets (minimum 44px) and Android guidelines
   * Hardware acceleration for smooth animations (`transform: translateZ(0)`)
   * Backdrop blur support across browsers with fallbacks

9. **CI/CD & Deployment**
   * `.github/workflows/deploy.yml` – Modern GitHub Actions with:
     * Node.js 20, proper caching
     * GitHub Pages deployment with proper permissions
   * `public/.nojekyll` for GitHub Pages

10. **Quality & Testing**
    * ESLint configuration for React + TypeScript
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
    "lint": "eslint ."
  },  "homepage": "https://${githubUser}.github.io/${repoName}/"
}
```

### Tailwind CSS v4 Configuration

```css
/* src/index.css */
@import "tailwindcss";

/* Essential mobile-first styles, standardized button system, 
   iOS optimizations, touch feedback, and responsive design patterns */

/* Touch-friendly buttons and interactions */
button, 
.btn-primary,
.btn-secondary,
.btn-small,
.btn-icon {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Standardized Button System with iOS optimizations */
.btn-primary {
  @apply px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md;
  @apply hover:bg-blue-700 active:bg-blue-800;
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all duration-200 flex items-center justify-center;
  @apply min-h-[44px]; /* iOS touch target minimum */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-secondary {
  @apply px-4 py-2 text-sm font-medium border rounded-md transition-all duration-200;
  @apply border-gray-300 text-gray-700 bg-white hover:bg-gray-50;
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply min-h-[44px] flex items-center justify-center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.btn-icon {
  @apply p-3 text-gray-500 hover:text-gray-700 rounded-md;
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply transition-colors duration-200;
  @apply min-w-[44px] min-h-[44px] flex items-center justify-center;
}

/* Dark mode variants */
.dark .btn-primary {
  @apply focus:ring-offset-gray-800;
}

.dark .btn-secondary {
  @apply border-gray-500 text-gray-200 bg-gray-700 hover:bg-gray-600;
  @apply focus:ring-offset-gray-800;
}

.dark .btn-icon {
  @apply text-gray-400 hover:text-gray-200 focus:ring-offset-gray-800;
}

/* Mobile touch feedback */
.btn-primary:active,
.btn-secondary:active,
.btn-icon:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* Safe area support for notched devices */
@supports(padding: max(0px)) {
  .px-safe {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
  
  .pb-safe {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
  
  .pt-safe {
    padding-top: max(0.5rem, env(safe-area-inset-top));
  }
}

/* iOS-specific enhancements */
@supports (-webkit-touch-callout: none) {
  /* iOS-specific styling for better experience */
  button {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* Improve button active states for iOS */
  .btn-primary:active,
  .btn-secondary:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
  
  /* iOS backdrop blur improvements */
  .backdrop-blur-sm {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  
  /* Better iOS scrolling */
  .overflow-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Mobile-first responsive patterns */
@media (max-width: 640px) {
  /* Mobile typography adjustments */
  .markdown-body {
    font-size: 15px;
    line-height: 1.5;
  }
  
  .markdown-body h1 {
    font-size: 1.75em;
    margin-top: 1.5rem;
  }
  
  .markdown-body h2 {
    font-size: 1.35em;
    margin-top: 1.25rem;
  }
  
  /* Better touch targets */
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
  }
  
  /* Mobile-optimized tables */
  .markdown-body table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  .markdown-body {
    font-size: 16px;
    line-height: 1.6;
  }
  
  .btn-primary,
  .btn-secondary {
    min-height: 40px;
  }
}

/* Desktop enhancements */
@media (min-width: 1025px) {
  .markdown-body {
    font-size: 16px;
    line-height: 1.6;
  }
}
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'github-blue': '#0969da',
      },
      fontFamily: {
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

```javascript
// postcss.config.js (minimal when using @tailwindcss/vite)
export default {
  plugins: {
    autoprefixer: {},
  },
}
```

### Essential Component Patterns

```tsx
// Mobile-first responsive component pattern
const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10 pt-safe">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
          {/* App icon with gradient and touch feedback */}
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center app-icon shadow-md">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          
          {/* Responsive title with truncation */}
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-full">
            App Name
          </h1>
        </div>
        
        {/* Action buttons with proper touch targets */}
        <div className="flex items-center space-x-2">
          <button className="btn-icon" aria-label="Theme toggle">
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

// PWA install prompt with iOS styling
const InstallPrompt: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-xl z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <h3 className="font-semibold text-sm">Install App</h3>
          <p className="text-blue-100 text-xs">Add to home screen for better experience</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-install-primary">Install</button>
          <button className="btn-install-ghost">Later</button>
        </div>
      </div>
    </div>
  );
};

// Mobile drawer with iOS-style backdrop
const MobileDrawer: React.FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
  return (
    <>
      {/* Content drawer */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} rounded-t-xl shadow-xl z-30 pb-safe`}>
        {/* iOS-style drag handle */}
        <div className="w-full h-1.5 flex items-center justify-center p-3">
          <div className="w-14 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        {/* Content here */}
      </div>
      
      {/* Backdrop with blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
};
```

### Essential React Hooks for PWAs

```tsx
// Theme hook with system preference detection
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
      
      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    };

    updateTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    
    localStorage.setItem('theme', theme);
    
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  return { theme, setTheme, isDark };
};

// PWA hook with install prompt handling
const usePWA = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    
    setDeferredPrompt(null);
  };

  return { canInstall, showInstallPrompt };
};

// Mobile detection with responsive breakpoints
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet };
};
```

**Success Criteria:**
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
- Tailwind CSS v4 setup with @tailwindcss/vite plugin (not postcss)
- Icon generation with proper dimensions and formats
- ESLint configuration conflicts
- Package.json script ordering for builds
- Missing dependencies that cause build failures
- PWA manifest validation requirements
- Service worker registration timing
- Mobile viewport and touch handling
- Safe area insets for notched devices (iPhone X+)
- iOS-specific button touch targets (44px minimum)
- Backdrop filter support across browsers
- Touch action manipulation for better scrolling
- Dark mode class-based implementation
- Mobile-first responsive breakpoints
- Cross-platform install prompt handling
- GitHub Pages deployment with proper permissions
- Workbox caching strategies for static assets
- Runtime caching for GitHub Pages domains

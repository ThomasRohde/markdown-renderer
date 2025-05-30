# PWA Update Testing Guide

## How to Test PWA Updates Work Properly

Your markdown renderer uses Vite PWA with `registerType: 'prompt'` which means users get prompted for updates. Here's how to verify the update mechanism:

### 1. **Development Testing**

#### Method 1: Version the Service Worker
1. Build and deploy your current version
2. Make a small change (e.g., change a text or add a console.log)
3. Build and deploy again
4. Visit your PWA app
5. You should see the PWA Update Checker component appear with "Update Available"

#### Method 2: Force Service Worker Update
1. Open DevTools (F12) → Application tab → Service Workers
2. Check "Update on reload" checkbox
3. Reload the page - this simulates a new version being available

### 2. **Manual Testing Steps**

```bash
# 1. Deploy current version
npm run deploy

# 2. Install the PWA on your device (if not already installed)
# - On mobile: Use "Add to Home Screen"
# - On desktop: Click install icon in address bar

# 3. Make a small change to test updates
# Edit any component (e.g., add a console.log)

# 4. Deploy the update
npm run deploy

# 5. Open the installed PWA
# - You should see the green "Update Available" banner
# - Click "Update Now" to apply the update
# - The app should reload with the new version
```

### 3. **Verification Methods**

#### A. Check Service Worker Status
Open DevTools → Application → Service Workers:
- **Active**: Currently running service worker
- **Waiting**: New version ready to activate
- **Installing**: New version being downloaded

#### B. Check Cache Status
DevTools → Application → Storage:
- **Cache Storage**: Should show `app-cache` with your app files
- **IndexedDB**: Should show your app's stored documents

#### C. Version Verification
```javascript
// Run in console to check current SW version
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Active SW:', reg.active?.scriptURL);
  console.log('Waiting SW:', reg.waiting?.scriptURL);
});
```

### 4. **Debug Component**

The `PWADebugInfo` component (only visible in development) shows:
- ✅/❌ Service Worker Available
- ✅/❌ App Controlled by Service Worker  
- Display Mode (Standalone/Browser)
- Current Service Worker URL

### 5. **Update Process Flow**

1. **New Version Deployed** → GitHub Actions builds and deploys
2. **User Visits App** → Service worker checks for updates
3. **Update Found** → Downloads new service worker in background
4. **Update Ready** → PWAUpdateChecker shows green banner
5. **User Clicks "Update"** → Activates new service worker
6. **App Reloads** → User gets the latest version

### 6. **Common Issues & Solutions**

#### Issue: No Update Prompt Appears
**Causes:**
- Service worker not properly registered
- No actual changes between versions
- Browser cache issues
- PWA not properly configured

**Debug:**
```javascript
// Check if SW is registered
navigator.serviceWorker.getRegistration().then(reg => {
  if (!reg) console.error('No service worker registered');
  else console.log('SW registered:', reg);
});
```

#### Issue: Update Fails
**Causes:**
- Network connectivity issues
- Service worker scope problems
- Build/deployment issues

**Debug:**
```javascript
// Check SW state
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW state:', reg.active?.state);
  console.log('Waiting SW:', reg.waiting);
});
```

### 7. **Testing on Different Devices**

#### Mobile Testing:
1. Install PWA on mobile home screen
2. Deploy update
3. Open app from home screen (not browser)
4. Should see update prompt

#### Desktop Testing:
1. Install PWA from browser
2. Deploy update  
3. Open PWA from Start Menu/Dock
4. Should see update prompt

### 8. **Automated Testing**

Your project includes Lighthouse CI which tests PWA functionality:

```bash
# Run PWA audit
npm run test:pwa
```

This verifies:
- Service worker installation
- Offline functionality
- PWA manifest
- Install prompts

### 9. **Network Testing**

Test update behavior under different network conditions:
- **Fast connection**: Updates should download quickly
- **Slow connection**: Updates should queue and complete
- **Offline**: App should work with last cached version
- **Back online**: Should check for updates

### 10. **Production Verification**

After deploying to production:
1. Visit https://thomasrohde.github.io/markdown-renderer/
2. Install the PWA
3. Check DevTools for service worker registration
4. Verify offline functionality works
5. Deploy a minor update and test the update flow

The PWA update mechanism is working if:
- ✅ Service worker registers successfully
- ✅ Update prompts appear when new versions are deployed
- ✅ Updates apply correctly when user accepts
- ✅ App works offline with cached version
- ✅ No console errors during update process

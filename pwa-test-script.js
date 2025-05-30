// PWA Update Testing Script
// Run this in the browser console to test update mechanism

console.log('🔄 PWA Update Testing Script');
console.log('===========================');

// Check if service worker is supported
if (!('serviceWorker' in navigator)) {
  console.error('❌ Service Worker not supported');
} else {
  console.log('✅ Service Worker supported');
}

// Function to check current PWA status
async function checkPWAStatus() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.log('❌ No service worker registered');
      return null;
    }

    console.log('✅ Service Worker registered');
    console.log('📋 Registration details:');
    console.log('  - Scope:', registration.scope);
    console.log('  - Active SW:', registration.active?.scriptURL);
    console.log('  - Waiting SW:', registration.waiting?.scriptURL);
    console.log('  - Installing SW:', registration.installing?.scriptURL);
    
    // Check if update is available
    if (registration.waiting) {
      console.log('🔄 UPDATE AVAILABLE! Waiting service worker found.');
      return { hasUpdate: true, registration };
    } else if (registration.installing) {
      console.log('⏳ Update installing...');
      return { isInstalling: true, registration };
    } else {
      console.log('✅ No updates available');
      return { hasUpdate: false, registration };
    }
    
  } catch (error) {
    console.error('❌ Error checking PWA status:', error);
    return null;
  }
}

// Function to force check for updates
async function checkForUpdates() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log('🔍 Checking for updates...');
      await registration.update();
      console.log('✅ Update check completed');
      
      // Wait a bit and check status again
      setTimeout(async () => {
        console.log('🔄 Rechecking status after update...');
        await checkPWAStatus();
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Error checking for updates:', error);
  }
}

// Function to apply waiting update
async function applyUpdate() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      console.log('🔄 Applying update...');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('✅ Update message sent. Page will reload when ready.');
    } else {
      console.log('❌ No waiting service worker to update');
    }
  } catch (error) {
    console.error('❌ Error applying update:', error);
  }
}

// Function to check display mode
function checkDisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
  
  console.log('📱 Display Mode:');
  console.log('  - Standalone:', isStandalone ? '✅' : '❌');
  console.log('  - Fullscreen:', isFullscreen ? '✅' : '❌');
  console.log('  - Minimal UI:', isMinimalUI ? '✅' : '❌');
  console.log('  - Browser:', !isStandalone && !isFullscreen && !isMinimalUI ? '✅' : '❌');
  
  return { isStandalone, isFullscreen, isMinimalUI };
}

// Function to check cache status
async function checkCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    console.log('💾 Cache Status:');
    console.log('  - Cache names:', cacheNames);
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      console.log(`  - ${cacheName}: ${keys.length} entries`);
    }
  } catch (error) {
    console.error('❌ Error checking cache:', error);
  }
}

// Main testing function
async function runPWATests() {
  console.log('🚀 Starting PWA Tests...');
  console.log('========================');
  
  // 1. Check PWA status
  console.log('\n1️⃣ Checking PWA Status:');
  const status = await checkPWAStatus();
  
  // 2. Check display mode
  console.log('\n2️⃣ Checking Display Mode:');
  checkDisplayMode();
  
  // 3. Check cache status
  console.log('\n3️⃣ Checking Cache Status:');
  await checkCacheStatus();
  
  // 4. Listen for updates
  console.log('\n4️⃣ Setting up update listeners:');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed - reloading...');
      window.location.reload();
    });
    
    console.log('✅ Update listeners set up');
  }
  
  console.log('\n📋 Test Commands Available:');
  console.log('  - checkPWAStatus() - Check current status');
  console.log('  - checkForUpdates() - Force check for updates');
  console.log('  - applyUpdate() - Apply waiting update');
  console.log('  - checkDisplayMode() - Check how app is displayed');
  console.log('  - checkCacheStatus() - Check cache contents');
  
  return status;
}

// Make functions available globally for testing
window.checkPWAStatus = checkPWAStatus;
window.checkForUpdates = checkForUpdates;
window.applyUpdate = applyUpdate;
window.checkDisplayMode = checkDisplayMode;
window.checkCacheStatus = checkCacheStatus;
window.runPWATests = runPWATests;

// Auto-run tests
runPWATests();

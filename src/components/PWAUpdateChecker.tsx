import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface UpdateInfo {
  hasUpdate: boolean;
  updatePrompt?: () => Promise<void>;
  needRefresh?: boolean;
}

export const PWAUpdateChecker: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({ hasUpdate: false });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check if service worker is registered and has an update available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('SW Registration found:', registration);
          
          // Check for waiting service worker (update available)
          if (registration.waiting) {
            console.log('SW Update available - waiting worker found');
            setUpdateInfo({ 
              hasUpdate: true, 
              updatePrompt: () => updateServiceWorker(registration)
            });
          }

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('SW Update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('SW State changed to:', newWorker.state);
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('SW New version available');
                  setUpdateInfo({ 
                    hasUpdate: true, 
                    updatePrompt: () => updateServiceWorker(registration)
                  });
                }
              });
            }
          });
        }
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('SW Controller changed - reloading page');
        window.location.reload();
      });
    }
  }, []);

  const updateServiceWorker = async (registration: ServiceWorkerRegistration): Promise<void> => {
    setIsUpdating(true);
    try {
      if (registration.waiting) {
        // Send skip waiting message to the waiting service worker
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Error updating service worker:', error);
      setIsUpdating(false);
    }
  };

  if (!updateInfo.hasUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-green-600 text-white rounded-xl shadow-xl p-4 z-50 backdrop-blur-sm bg-opacity-95 border border-green-500">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <RefreshCw className={`w-6 h-6 ${isUpdating ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium">Update Available</h3>
          <p className="text-xs text-green-100 mt-1">
            A new version of the app is ready to install.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => updateInfo.updatePrompt?.()}
              disabled={isUpdating}
              className="bg-white text-green-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-50 disabled:opacity-50 transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update Now'}
            </button>
            <button
              onClick={() => setUpdateInfo({ hasUpdate: false })}
              className="text-green-100 px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Debug component to show service worker status
export const PWADebugInfo: React.FC = () => {
  const [swInfo, setSwInfo] = useState<{
    hasServiceWorker: boolean;
    isControlled: boolean;
    registration?: ServiceWorkerRegistration;
    currentVersion?: string;
  }>({
    hasServiceWorker: false,
    isControlled: false
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setSwInfo({
          hasServiceWorker: !!registration,
          isControlled: !!navigator.serviceWorker.controller,
          registration,
          currentVersion: registration?.active?.scriptURL
        });
      });
    }
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs max-w-xs z-40">
      <div className="font-bold mb-1">PWA Debug Info:</div>
      <div>SW Available: {swInfo.hasServiceWorker ? '✅' : '❌'}</div>
      <div>Controlled: {swInfo.isControlled ? '✅' : '❌'}</div>
      <div>Display Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</div>
      {swInfo.currentVersion && (
        <div className="truncate" title={swInfo.currentVersion}>
          SW: {swInfo.currentVersion.split('/').pop()}
        </div>
      )}
    </div>
  );
};

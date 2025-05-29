import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if prompt was previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    console.log('PWA: Initializing dismissed state:', dismissed === 'true');
    return dismissed === 'true';
  });

  useEffect(() => {    // Check if already installed/standalone
    const checkInstallStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as NavigatorWithStandalone).standalone ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkInstallStatus();    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('PWA: beforeinstallprompt event fired, isDismissed:', isDismissed);
      // Only set the install prompt if it hasn't been dismissed
      if (!isDismissed) {
        console.log('PWA: Setting install prompt');
        setInstallPrompt(e as BeforeInstallPromptEvent);
      } else {
        console.log('PWA: Install prompt was dismissed, not setting');
      }
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissed]);
  const showInstallPrompt = async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  };  const dismissInstallPrompt = () => {
    console.log('PWA: Dismissing install prompt');
    setIsDismissed(true);
    setInstallPrompt(null); // Clear the current install prompt immediately
    try {
      localStorage.setItem('pwa-install-dismissed', 'true');
      console.log('PWA: Saved dismiss state to localStorage');
    } catch (error) {
      console.error('Error saving dismiss state:', error);
    }
  };

  const canInstall = !isInstalled && installPrompt !== null && !isDismissed;
  return {
    canInstall,
    isInstalled,
    isStandalone,
    showInstallPrompt,
    dismissInstallPrompt,
  };
}

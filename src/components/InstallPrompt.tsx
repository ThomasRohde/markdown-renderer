import React from 'react';
import { Download } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { canInstall, showInstallPrompt, dismissInstallPrompt } = usePWA();

  const handleInstall = async () => {
    const success = await showInstallPrompt();
    if (success) {
      console.log('App installation initiated');
    }
  };

  if (!canInstall) {
    return null;
  }  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white rounded-xl shadow-xl p-4 z-40 backdrop-blur-sm bg-opacity-95 border border-blue-500">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img 
            src="/markdown-renderer/icon-192.png" 
            alt="Markdown Viewer App Icon"
            className="w-12 h-12 rounded-xl shadow-sm app-icon-pulse"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-medium">Install Markdown Viewer</h4>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Add to your home screen for offline use & better experience
          </p>
        </div>
      </div>
      <div className="flex space-x-3 mt-3">
        <button
          onClick={handleInstall}
          className="btn-install-primary flex items-center justify-center gap-2 flex-1 min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          Install Now
        </button>        <button
          onClick={dismissInstallPrompt}
          className="btn-install-ghost min-h-[44px]"
        >
          Later
        </button>
      </div>
    </div>
  );
};

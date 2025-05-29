import React from 'react';
import { usePWA } from '../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { canInstall, showInstallPrompt } = usePWA();

  const handleInstall = async () => {
    const success = await showInstallPrompt();
    if (success) {
      console.log('App installation initiated');
    }
  };

  if (!canInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white rounded-lg shadow-lg p-4 z-40">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">M</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium">Install Markdown Viewer</h4>
          <p className="text-xs text-blue-100 mt-1">
            Add to your home screen for quick access and offline use
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleInstall}
          className="flex-1 bg-white text-blue-600 text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
        >
          Install
        </button>
        <button
          onClick={() => {/* Could implement dismiss logic */}}
          className="text-blue-100 text-sm py-2 px-3 hover:text-white"
        >
          Later
        </button>
      </div>
    </div>
  );
};

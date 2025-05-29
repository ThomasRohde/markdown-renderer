import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDisplayTime = 1500
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center justify-center animate-pulse">
          <div className="w-24 h-24 app-icon rounded-2xl flex items-center justify-center mb-6 shadow-lg border-4 border-white border-opacity-20">
            <span className="text-white text-4xl font-bold">M</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Markdown Viewer</h1>
          <p className="text-blue-100 dark:text-gray-400 text-sm">View & Share Documents</p>
        </div>
        <div className="mt-8">
          <div className="w-12 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-loadingBar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

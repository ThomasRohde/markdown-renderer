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
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 z-50 flex items-center justify-center px-4 py-safe">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center justify-center animate-pulse">
          <div className="w-28 h-28 app-icon rounded-3xl flex items-center justify-center mb-8 shadow-2xl border-4 border-white border-opacity-20 bg-white bg-opacity-10 backdrop-blur-sm">
            <span className="text-white text-5xl font-bold">M</span>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2 text-center">Markdown Viewer</h1>
          <p className="text-blue-100 dark:text-gray-400 text-base text-center px-4">View & Share Documents</p>
        </div>
        <div className="mt-12">
          <div className="w-16 h-1.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-loadingBar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

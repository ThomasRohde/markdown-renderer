import React from 'react';

interface PullToRefreshProps {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  pullDownThreshold: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isPulling,
  pullDistance,
  isRefreshing,
  pullDownThreshold
}) => {
  // Calculate progress percentage for the indicator
  const progress = Math.min(100, (pullDistance / pullDownThreshold) * 100);
  
  if (!isPulling && !isRefreshing) {
    return null;
  }
    return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-300 ease-out pt-safe"
      style={{ transform: `translateY(${pullDistance}px)` }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 mx-auto flex items-center justify-center border border-gray-200 dark:border-gray-700"
           style={{
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             backgroundColor: 'rgba(255, 255, 255, 0.9)',
           }}>
        {isRefreshing ? (
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
        ) : (
          <div className="relative h-7 w-7">
            {/* Progress circle */}
            <svg className="w-7 h-7 transform rotate-270" viewBox="0 0 24 24">
              <circle
                className="text-gray-200 dark:text-gray-700"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle
                className="text-blue-600 transition-all duration-150"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${progress * 0.63} 100`}
                transform="rotate(-90 12 12)"
              />
            </svg>
            
            {/* Arrow icon changes when pulled enough */}
            {progress >= 100 ? (
              <svg
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 11l7-7 7 7M5 19l7-7 7 7" />
              </svg>
            ) : (
              <svg
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

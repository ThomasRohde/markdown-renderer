import { useEffect, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  pullDownThreshold = 80, 
  maxPullDownDistance = 120 
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let startY = 0;
    let isBeingTouched = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh if we're at the top of the document
      if (window.scrollY === 0) {
        isBeingTouched = true;
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isBeingTouched) return;
      
      const currentY = e.touches[0].clientY;
      let distance = currentY - startY;
      
      // Only allow pulling down, not up
      if (distance < 0) {
        distance = 0;
      }
      
      // Apply resistance as user pulls further down
      if (distance > 0) {
        // Prevent default to stop scrolling
        e.preventDefault();
        
        // Apply resistance function - the further you pull, the harder it gets
        distance = Math.min(maxPullDownDistance, distance / 2);
        
        setPullDistance(distance);
      }
    };
    
    const handleTouchEnd = async () => {
      if (!isBeingTouched) return;
      
      isBeingTouched = false;
      
      // If pulled far enough, trigger refresh
      if (pullDistance > pullDownThreshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      // Reset pull distance with animation
      setPullDistance(0);
      setIsPulling(false);
    };
    
    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [maxPullDownDistance, onRefresh, pullDistance, pullDownThreshold]);
  
  return { isPulling, pullDistance, isRefreshing };
};

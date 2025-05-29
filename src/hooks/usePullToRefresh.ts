import { useEffect, useState, useCallback } from 'react';

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
  const [velocity, setVelocity] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [lastTime, setLastTime] = useState(0);

  // Calculate velocity for momentum effect
  const calculateVelocity = useCallback((currentY: number, currentTime: number) => {
    if (lastY && lastTime) {
      const deltaY = currentY - lastY;
      const deltaTime = currentTime - lastTime;
      return deltaY / deltaTime;
    }
    return 0;
  }, [lastY, lastTime]);

  useEffect(() => {
    let startY = 0;
    let isBeingTouched = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh if we're at the top of the document
      if (window.scrollY === 0) {
        isBeingTouched = true;
        startY = e.touches[0].clientY;
        setLastY(startY);
        setLastTime(e.timeStamp);
        setIsPulling(true);
        setVelocity(0);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isBeingTouched) return;
      
      const currentY = e.touches[0].clientY;
      let distance = currentY - startY;
      
      // Calculate current velocity
      const currentVelocity = calculateVelocity(currentY, e.timeStamp);
      setVelocity(currentVelocity);
      setLastY(currentY);
      setLastTime(e.timeStamp);
      
      // Only allow pulling down, not up
      if (distance < 0) {
        distance = 0;
      }
      
      // iOS-style progressive resistance
      if (distance > 0) {
        // Prevent default to stop scrolling
        e.preventDefault();
        
        // Progressive resistance that increases as you pull further
        // Using a logarithmic curve for natural feel
        const resistance = Math.log10(distance + 10) / 1.5;
        distance = Math.min(maxPullDownDistance, distance * resistance / 2);
        
        // Apply slight elasticity at the edges
        if (distance > maxPullDownDistance * 0.9) {
          const overshoot = distance - (maxPullDownDistance * 0.9);
          distance = maxPullDownDistance * 0.9 + (overshoot * 0.2);
        }
        
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
      
      // Apply momentum-based animation
      const momentum = Math.abs(velocity) > 0.5;
      if (momentum) {
        const duration = Math.min(400, Math.abs(velocity * 100));
        const finalDistance = 0;
        
        // Animate with momentum
        const startDistance = pullDistance;
        const startTime = performance.now();
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(1, elapsed / duration);
          
          // Ease out cubic
          const easing = 1 - Math.pow(1 - progress, 3);
          const current = startDistance - (startDistance * easing);
          
          setPullDistance(current);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setPullDistance(finalDistance);
            setIsPulling(false);
          }
        };
        
        requestAnimationFrame(animate);
      } else {
        // Reset pull distance without momentum
        setPullDistance(0);
        setIsPulling(false);
      }
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
  }, [maxPullDownDistance, onRefresh, pullDistance, pullDownThreshold, calculateVelocity, velocity]);
  
  return { isPulling, pullDistance, isRefreshing };
};

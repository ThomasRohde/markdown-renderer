import { useEffect, useState, useRef } from 'react';

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
  const pullDistanceRef = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use refs to track motion data without triggering rerenders
  const velocityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let startY = 0;
    let isBeingTouched = false;
    let hasMovedSignificantly = false;

    const calculateVelocity = (currentY: number, currentTime: number) => {
      if (lastYRef.current && lastTimeRef.current) {
        const deltaY = currentY - lastYRef.current;
        const deltaTime = currentTime - lastTimeRef.current;
        return deltaY / deltaTime;
      }
      return 0;
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh if we're at the top of the document
      // and the touch didn't start on an interactive element
      const target = e.target as Element;
      
      // Check if touch started on a button, link, or other interactive element
      if (target.closest('button, a, input, textarea, select, [role="button"], [onclick]')) {
        return;
      }
      
      if (window.scrollY === 0) {
        isBeingTouched = true;
        hasMovedSignificantly = false;
        startY = e.touches[0].clientY;
        lastYRef.current = startY;
        lastTimeRef.current = e.timeStamp;
        velocityRef.current = 0;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isBeingTouched) return;
      
      const currentY = e.touches[0].clientY;
      let distance = currentY - startY;
      
      // Calculate current velocity
      const currentVelocity = calculateVelocity(currentY, e.timeStamp);
      velocityRef.current = currentVelocity;
      lastYRef.current = currentY;
      lastTimeRef.current = e.timeStamp;
      
      // Only track significant movement to avoid interfering with taps
      if (Math.abs(distance) > 10) {
        hasMovedSignificantly = true;
        setIsPulling(true);
      }
      
      // Only allow pulling down, not up
      if (distance < 0) {
        distance = 0;
      }
      
      // iOS-style progressive resistance
      if (distance > 0 && hasMovedSignificantly) {
        // Only prevent default if we've actually started pulling significantly
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
        pullDistanceRef.current = distance;
      }
    };
      const handleTouchEnd = async () => {
      if (!isBeingTouched) return;
      
      isBeingTouched = false;
      hasMovedSignificantly = false;
      
      // If pulled far enough, trigger refresh
      if (pullDistanceRef.current > pullDownThreshold) {
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
      const momentum = Math.abs(velocityRef.current) > 0.5;
      if (momentum) {
        const duration = Math.min(400, Math.abs(velocityRef.current * 100));
        const finalDistance = 0;
        
        // Animate with momentum
        const startDistance = pullDistanceRef.current;
        const startTime = performance.now();
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(1, elapsed / duration);
          
          // Ease out cubic
          const easing = 1 - Math.pow(1 - progress, 3);
          const current = startDistance - (startDistance * easing);
          
          setPullDistance(current);
          pullDistanceRef.current = current;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setPullDistance(finalDistance);
            pullDistanceRef.current = finalDistance;
            setIsPulling(false);
          }
        };
        
        requestAnimationFrame(animate);
      } else {
        // Reset pull distance without momentum
        setPullDistance(0);
        pullDistanceRef.current = 0;
        setIsPulling(false);
        velocityRef.current = 0;
      }
    };
    
    // Add event listeners with better specificity
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [maxPullDownDistance, onRefresh, pullDownThreshold]);
  
  return { isPulling, pullDistance, isRefreshing };
};

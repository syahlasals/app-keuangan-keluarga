'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
        // Trigger sync when back online
        window.dispatchEvent(new CustomEvent('network-restored'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for visibility change to check connectivity
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if we're actually online when app becomes visible
        const actuallyOnline = navigator.onLine;
        if (actuallyOnline !== isOnline) {
          setIsOnline(actuallyOnline);
          if (actuallyOnline && wasOffline) {
            setWasOffline(false);
            window.dispatchEvent(new CustomEvent('network-restored'));
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOnline, wasOffline]);

  return { isOnline, wasOffline };
}
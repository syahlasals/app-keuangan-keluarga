import { useEffect, useRef, useCallback } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to automatically refresh data when page becomes visible and periodically
 * This ensures data stays synchronized with Supabase
 */
export const useDataRefresh = () => {
  const { user } = useAuthStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchTransactions } = useTransactionStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = useCallback(() => {
    if (user) {
      fetchCategories();
      fetchTransactions(true);
    }
  }, [user, fetchCategories, fetchTransactions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        refreshData();
      }
    };

    const handleFocus = () => {
      // Refresh data when window gains focus
      refreshData();
    };

    const handleOnline = () => {
      // Refresh data when coming back online
      refreshData();
    };

    // Periodic refresh every 2 minutes when page is visible
    const startPeriodicRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          refreshData();
        }
      }, 120000); // 2 minutes
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    // Start periodic refresh
    startPeriodicRefresh();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshData]);
};
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized, initialize } = useAuthStore();
  const { ensureCategoriesLoaded } = useCategoryStore();
  const { fetchTransactions } = useTransactionStore();

  const [isReady, setIsReady] = useState(false);

  // Auth routes that don't require authentication
  const authRoutes = ['/auth/login', '/auth/register', '/auth/reset-password', '/offline'];
  const isAuthRoute = authRoutes.includes(pathname) || pathname === '/';

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth first
        if (!initialized) {
          await initialize();
        }

        // Small delay to ensure auth state is settled
        await new Promise(resolve => setTimeout(resolve, 100));

        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true); // Still set ready to prevent infinite loading
      }
    };

    initializeApp();
  }, [initialized, initialize]);

  // Handle navigation after auth is ready
  useEffect(() => {
    if (!isReady) return;

    // If we're on homepage, redirect based on auth status
    if (pathname === '/') {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
      return;
    }

    // If we're on a protected route without auth, redirect to login
    if (!isAuthRoute && !user) {
      router.replace('/auth/login');
      return;
    }

    // If we're on auth route but already authenticated, redirect to dashboard
    if (isAuthRoute && user && pathname !== '/') {
      router.replace('/dashboard');
      return;
    }
  }, [isReady, user, pathname, router, isAuthRoute]);

  // Preload data when user is authenticated and on protected routes
  useEffect(() => {
    if (isReady && user && !isAuthRoute) {
      // Preload essential data in background
      const preloadData = async () => {
        try {
          await Promise.all([
            ensureCategoriesLoaded(user.id),
            fetchTransactions()
          ]);
        } catch (error) {
          console.warn('Data preload failed:', error);
          // Don't block UI, data will be loaded by individual components
        }
      };

      preloadData();
    }
  }, [isReady, user, isAuthRoute, ensureCategoriesLoaded, fetchTransactions]);

  // Don't render anything until auth is ready
  if (!isReady) {
    return null; // Clean loading without spinners
  }

  // Don't render protected content until auth check is complete
  if (!isAuthRoute && !user) {
    return null; // Clean loading while redirecting
  }

  return <>{children}</>;
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add small delay to ensure environment variables are loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth session error:', error);
          router.replace('/auth/login');
          return;
        }

        if (session) {
          router.replace('/dashboard');
        } else {
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Ensure we always redirect somewhere to prevent infinite loading
        router.replace('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  // No loading screen, just redirect immediately
  return null;
}
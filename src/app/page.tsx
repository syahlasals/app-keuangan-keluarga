'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          router.replace('/dashboard');
        } else {
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-success-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-700">Memuat...</h1>
        <p className="text-gray-500 mt-2">Keuangan Keluarga</p>
      </div>
    </div>
  );
}
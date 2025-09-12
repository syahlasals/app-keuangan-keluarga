'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from './AuthProvider';
import BottomNavigation from './BottomNavigation';
import InstallPrompt from './InstallPrompt';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Pages that should not show bottom navigation
  const hideNavigation = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/offline',
  ].includes(pathname) || pathname === '/';

  return (
    <AuthProvider>
      <div id="root" className="min-h-screen">
        {children}
        {!hideNavigation && <BottomNavigation />}
        <InstallPrompt />
      </div>
    </AuthProvider>
  );
}
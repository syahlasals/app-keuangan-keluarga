'use client';

import { usePathname } from 'next/navigation';
import BottomNavigation from './BottomNavigation';

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
  ].includes(pathname) || pathname === '/';

  return (
    <div id="root" className="min-h-screen">
      {children}
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
}
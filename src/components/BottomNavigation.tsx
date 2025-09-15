'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CreditCard, Settings, User } from 'lucide-react';

interface NavItem {
  href: string;
  icon: any;
  label: string;
  activePatterns: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    activePatterns: ['/dashboard', '/'],
  },
  {
    href: '/transactions',
    icon: CreditCard,
    label: 'Transaksi',
    activePatterns: ['/transactions'],
  },
  {
    href: '/categories',
    icon: Settings,
    label: 'Kategori',
    activePatterns: ['/categories'],
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profil',
    activePatterns: ['/profile'],
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (patterns: string[]) => {
    return patterns.some(pattern => {
      if (pattern === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(pattern);
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 border-t border-white/40 safe-bottom md:hidden shadow-glass backdrop-blur-md">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.activePatterns);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 transition-all duration-300 rounded-xl ${active
                ? 'text-primary-500 bg-primary-100/80 shadow-glass'
                : 'text-text-500 hover:text-text-700 hover:bg-white/50'
                } backdrop-blur-md`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'text-primary-500' : ''}`} />
              <span className={`text-xs ${active ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
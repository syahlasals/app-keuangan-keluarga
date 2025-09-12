'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CreditCard, User, Settings } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.activePatterns);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${active
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'text-primary-600' : ''}`} />
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
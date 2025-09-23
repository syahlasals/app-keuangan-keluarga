'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CreditCard, Settings, Tag, Plus } from 'lucide-react';

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
    icon: Tag,
    label: 'Kategori',
    activePatterns: ['/categories'],
  },
  {
    href: '/others',
    icon: Settings,
    label: 'Lainnya',
    activePatterns: ['/others'],
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 border-t border-white/40 safe-bottom md:hidden shadow-glass backdrop-blur-md rounded-t-3xl z-50">
      <div className="flex items-center justify-around py-3 relative">
        {/* Left nav */}
        <div className="flex flex-1 justify-evenly">
          {navItems.slice(0, 2).map((item) => {
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
        {/* Add Transaction Floating Button */}
        <Link
          href="/transactions/add"
          className="absolute left-1/2 -translate-x-1/2 -top-10 z-10 bg-primary-500 text-white rounded-full p-4 border-4 shadow-none hover:bg-primary-600 transition-all duration-300 flex items-center justify-center"
          style={{ boxShadow: '0 4px 24px 0 rgba(18,65,112,0.9)', border: '4px solid rgba(18,65,112,0.10)' }}
          aria-label="Tambah Transaksi"
        >
          <Plus className="h-7 w-7" />
        </Link>
        {/* Right nav */}
        <div className="flex flex-1 justify-evenly">
          {navItems.slice(2).map((item) => {
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
      </div>
    </nav>
  );
}

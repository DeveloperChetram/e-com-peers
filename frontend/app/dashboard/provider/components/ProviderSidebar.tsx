'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Settings,
  Store,
  ExternalLink,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface ProviderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard/provider',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/dashboard/provider/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/dashboard/provider/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Analytics',
    href: '/dashboard/provider/analytics',
    icon: TrendingUp,
  },
  {
    label: 'Settings',
    href: '/dashboard/provider/settings',
    icon: Settings,
  },
];

export default function ProviderSidebar({ isOpen, onClose }: ProviderSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#161922] border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Logo */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <Link href="/dashboard/provider" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm">
                SP
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tighter uppercase leading-tight text-gray-900 dark:text-gray-100">
                  SHOP.CO
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Provider Portal
                </span>
              </div>
            </Link>

            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`${
                      isActive
                        ? 'text-white dark:text-black'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white'
                    } transition-colors`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
          {/* Live Store Pill */}
          <Link
            href="/"
            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200/80 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 group"
          >
            <div className="flex items-center gap-2">
              <Store size={15} className="text-gray-500 dark:text-gray-400" />
              <span>Visit Live Store</span>
            </div>
            <ExternalLink size={13} className="text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Provider Status Card */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
                Store Status
              </span>
              <span className="text-[10px] font-bold bg-amber-200/70 dark:bg-amber-800/40 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                Active Partner
              </span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-1 leading-snug">
              Catalog & merchant tools synced with SHOP.CO
            </p>
          </div>

          {/* User Account / Logout */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
                P
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">My Provider Store</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">merchant@shop.co</p>
              </div>
            </div>

            <Link
              href="/login"
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

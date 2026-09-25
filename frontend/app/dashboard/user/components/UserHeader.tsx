'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Menu, Search, Bell, ShoppingBag, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';
import { RootState } from '@/redux/store';

interface UserHeaderProps {
  onToggleSidebar: () => void;
}

export default function UserHeader({ onToggleSidebar }: UserHeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  const displayName = (user as any)?.name || 'Shopper';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#161922]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Quick Search */}
        <div className="relative w-full max-w-xs sm:max-w-sm hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="search"
            placeholder="Search orders, items, help..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-full focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Theme Toggle, Bag & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Browse Store Link */}
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xs cursor-pointer"
        >
          <ShoppingBag size={14} />
          <span>Shop Catalog</span>
        </Link>

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#161922]" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {initials}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
              Personal Account
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

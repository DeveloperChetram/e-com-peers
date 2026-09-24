'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, CheckCircle2, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
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
            placeholder="Search products, providers, users..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-full focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Theme Toggle, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Approvals Action Link */}
        <Link
          href="/dashboard/admin/approvals"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
        >
          <CheckCircle2 size={14} className="text-amber-600 dark:text-amber-400" />
          <span>Approvals Queue</span>
        </Link>

        {/* View Live Store */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <span>Live Store</span>
          <ExternalLink size={12} />
        </Link>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#161922]" />
        </button>

        {/* Admin Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-black flex items-center justify-center text-xs font-bold shadow-xs">
            AD
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">Admin Console</p>
            <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Super Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

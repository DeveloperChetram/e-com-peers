'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ShieldAlert, Store } from 'lucide-react';
import ProviderSidebar from './components/ProviderSidebar';
import ProviderHeader from './components/ProviderHeader';
import { RootState } from '@/redux/store';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  const activeRole = (user as any)?.role || role;

  // Guard: not logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#161922] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Store size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Provider Sign In Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please sign in with your provider account to access the seller portal.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200"
            >
              Return Home
            </Link>
            <Link
              href="/login?role=provider"
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90"
            >
              Provider Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guard: wrong role
  if (activeRole && activeRole !== 'PROVIDER') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#161922] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Provider Access Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your current account does not have provider privileges to access the seller portal.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200"
            >
              Return Home
            </Link>
            <Link
              href="/login?role=provider"
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90"
            >
              Sign In as Provider
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 antialiased flex transition-colors duration-150">
      {/* Sidebar */}
      <ProviderSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <ProviderHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

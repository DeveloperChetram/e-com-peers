'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/auth.slice';
import { logoutUser } from '@/apis/auth.api';
import { UserCheck, Loader2 } from 'lucide-react';
import UserSidebar from './components/UserSidebar';
import UserHeader from './components/UserHeader';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  const handleSignInRedirect = async () => {
    try {
      await logoutUser().catch(() => {});
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  // Wait for initial auth check from cookies before showing guard
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F1117] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  // Guard: not logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#161922] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <UserCheck size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign In Required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please sign in to access your dashboard.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200"
            >
              Return Home
            </Link>
            <button
              onClick={handleSignInRedirect}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 antialiased flex transition-colors duration-150">
      {/* Sidebar */}
      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <UserHeader
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

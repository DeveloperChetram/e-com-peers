'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/auth.slice';
import { logoutUser } from '@/apis/auth.api';
import { clearUserFromStorage } from '@/utils/userStorage';

interface AuthHeaderButtonProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function AuthHeaderButton({
  size = 22,
  className = '',
  showText = false,
}: AuthHeaderButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout
    }
    clearUserFromStorage();
    dispatch(logout());
    router.replace('/login');
  };

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        title={`Logout (${user?.name || 'Account'})`}
        aria-label="Logout"
        className={`inline-flex items-center gap-1.5 p-2 rounded-full hover:bg-red-50 text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer ${className}`}
      >
        <LogOut size={size} />
        {showText && <span className="text-xs font-semibold">Logout</span>}
      </button>
    );
  }

  return (
    <Link
      href="/login"
      aria-label="Sign In"
      title="Sign In"
      className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-black transition-colors ${className}`}
    >
      <User size={size} />
    </Link>
  );
}

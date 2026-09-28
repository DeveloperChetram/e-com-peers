'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { getRoleFromStorage, getAppropriateDashboardUrl, getUserFromStorage } from '@/utils/userStorage';
import { Loader2 } from 'lucide-react';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, role, isInitialized, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const currentRole = (user as any)?.role || role || getRoleFromStorage();
    const storedUser = getUserFromStorage();

    if (currentRole && (user || storedUser)) {
      const target = getAppropriateDashboardUrl(currentRole);
      router.replace(target);
      return;
    }

    if (isInitialized && !isAuthenticated && !storedUser) {
      router.replace('/login');
    }
  }, [user, role, isInitialized, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
        <span>Navigating to your dashboard...</span>
      </div>
    </div>
  );
}

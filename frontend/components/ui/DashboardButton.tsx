'use client';

import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function DashboardButton() {
  const auth = useAppSelector((state) => state.auth);
  const effectiveRole = auth.role || (auth.user as any)?.role;
  
  if (effectiveRole === 'PROVIDER' || effectiveRole === 'PROVIDER_STAFF') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <Link
          href="/dashboard/user"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-colors"
        >
          <LayoutDashboard size={13} />
          <span>My Account</span>
        </Link>
        <Link
          href="/dashboard/provider"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          <LayoutDashboard size={13} />
          <span>Provider Portal</span>
        </Link>
      </div>
    );
  } else if (effectiveRole === 'ADMIN') {
    return (
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
      >
        <LayoutDashboard size={13} />
        <span>Admin Portal</span>
      </Link>
    );
  } else if (effectiveRole === 'USER') {
    return (
      <Link
        href="/dashboard/user"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
      >
        <LayoutDashboard size={13} />
        <span>My Account</span>
      </Link>
    );
  }

  return null;
}
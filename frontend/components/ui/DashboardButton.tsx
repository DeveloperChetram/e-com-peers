'use client';

import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function DashboardButton() {
  const user = useAppSelector((state) => state.auth);
  
  if (user.role === 'PROVIDER') {
    return (
      <Link
        href="/dashboard/provider"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
      >
        <LayoutDashboard size={13} />
        <span>Provider Portal</span>
      </Link>
    );
  } else if (user.role === 'ADMIN') {
    return (
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
      >
        <LayoutDashboard size={13} />
        <span>Admin Portal</span>
      </Link>
    );
  } else if (user.role === 'USER') {
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
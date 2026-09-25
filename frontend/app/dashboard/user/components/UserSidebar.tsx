'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Settings,
  ShoppingBag,
  ExternalLink,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/auth.slice';

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard/user',
    icon: LayoutDashboard,
  },
  {
    label: 'My Orders',
    href: '/dashboard/user/orders',
    icon: Package,
  },
  {
    label: 'Saved Wishlist',
    href: '/dashboard/user/wishlist',
    icon: Heart,
  },
  {
    label: 'Delivery Addresses',
    href: '/dashboard/user/addresses',
    icon: MapPin,
  },
  {
    label: 'Account & Security',
    href: '/dashboard/user/profile',
    icon: Settings,
  },
];

export default function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const displayName = (user as any)?.name || 'Shopper';
  const displayEmail = (user as any)?.email || 'user@shop.co';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

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
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm">
                SC
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tighter uppercase leading-tight text-gray-900 dark:text-gray-100">
                  SHOP.CO
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Customer Portal
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Info Capsule */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              My Account
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white dark:text-black' : 'text-gray-400 group-hover:text-black'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          {/* Quick link to store catalog */}
          <Link
            href="/products"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={17} className="text-gray-400" />
              <span>Continue Shopping</span>
            </div>
            <ExternalLink size={13} className="text-gray-400" />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

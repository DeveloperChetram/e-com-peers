'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckCircle2,
  Package,
  Layers,
  Store,
  Users,
  ShoppingBag,
  Settings,
  ExternalLink,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Product Approvals',
    href: '/dashboard/admin/approvals',
    icon: CheckCircle2,
  },
  {
    label: 'Products Catalog',
    href: '/dashboard/admin/products',
    icon: Package,
  },
  {
    label: 'Categories',
    href: '/dashboard/admin/categories',
    icon: Layers,
  },
  {
    label: 'Providers & Stores',
    href: '/dashboard/admin/providers',
    icon: Store,
  },
  {
    label: 'Customer Accounts',
    href: '/dashboard/admin/users',
    icon: Users,
  },
  {
    label: 'Orders',
    href: '/dashboard/admin/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tighter uppercase leading-tight text-gray-900 dark:text-gray-100">
                  SHOP.CO
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Admin Portal
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
              Admin Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

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
              <ShieldCheck size={15} className="text-gray-500 dark:text-gray-400" />
              <span>Public Storefront</span>
            </div>
            <ExternalLink size={13} className="text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Admin Role Status Card */}
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                <ShieldCheck size={12} className="text-indigo-600 dark:text-indigo-400" />
                Access Role
              </span>
              <span className="text-[10px] font-bold bg-indigo-200/70 dark:bg-indigo-800/40 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-400/90 mt-1 leading-snug">
              Full control over catalog & merchants
            </p>
          </div>

          {/* User Account / Logout */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
                A
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">Root Administrator</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">admin@shop.co</p>
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

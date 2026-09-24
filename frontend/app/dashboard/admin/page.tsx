import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Package,
  CheckCircle2,
  Clock,
  Store,
  Users,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Overview | SHOP.CO Portal',
  description: 'Manage platform operations, review merchant product approvals, and oversee catalog inventory.',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <ShieldCheck size={28} className="text-black dark:text-white" />
            <span>Admin Overview</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Platform governance, merchant management, and product approvals.
          </p>
        </div>

        <Link
          href="/dashboard/admin/approvals"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xs shrink-0"
        >
          <Clock size={16} />
          <span>Product Approvals</span>
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-3">4</p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">Products awaiting review</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Active Providers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Store size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-3">32</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active merchant partners</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Catalog Items</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-3">128</p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">Live products in catalog</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Customer Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-3">1,429</p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">Registered shoppers</span>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Action Queue Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161922] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Pending Product Approvals
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                New merchant listings requiring admin approval before publication.
              </p>
            </div>
            <Link
              href="/dashboard/admin/approvals"
              className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            {[
              {
                id: '1',
                name: 'Sony Wireless Headphones WH-1000XM5',
                provider: 'Apex Electronics',
                category: 'Audio',
                price: '$349.99',
              },
              {
                id: '2',
                name: 'Minimalist Oak Coffee Table',
                provider: 'Studio Forma',
                category: 'Home & Living',
                price: '$280.00',
              },
              {
                id: '3',
                name: 'Classic Vintage Leather Backpack',
                provider: 'Urban Gear Co.',
                category: 'Bags & Accessories',
                price: '$110.00',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      by {item.provider} • <span className="text-gray-600 dark:text-gray-300">{item.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{item.price}</span>
                  <Link
                    href="/dashboard/admin/approvals"
                    className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-4 transition-colors">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Quick Navigation
          </h2>

          <div className="space-y-2">
            {[
              {
                label: 'Taxonomy & Categories',
                href: '/dashboard/admin/categories',
                icon: Layers,
                desc: 'Manage store catalog hierarchy',
              },
              {
                label: 'Merchant Directory',
                href: '/dashboard/admin/providers',
                icon: Store,
                desc: 'View active seller stores',
              },
              {
                label: 'User Accounts',
                href: '/dashboard/admin/users',
                icon: Users,
                desc: 'Manage customer credentials',
              },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{link.label}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{link.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

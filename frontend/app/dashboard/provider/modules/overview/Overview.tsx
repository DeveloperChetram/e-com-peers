'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  DollarSign,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '$12,450.00',
    change: '+18.2%',
    isPositive: true,
    icon: DollarSign,
    subtitle: 'vs last month',
  },
  {
    title: 'Total Orders',
    value: '148',
    change: '+12.5%',
    isPositive: true,
    icon: ShoppingBag,
    subtitle: '12 pending fulfillment',
  },
  {
    title: 'Active Products',
    value: '36',
    change: '+4 new',
    isPositive: true,
    icon: Package,
    subtitle: '2 items low in stock',
  },
  {
    title: 'Conversion Rate',
    value: '3.42%',
    change: '+0.8%',
    isPositive: true,
    icon: TrendingUp,
    subtitle: 'Average order $84.12',
  },
];

const recentOrders = [
  {
    id: 'ORD-8921',
    customer: 'Sophia Davis',
    email: 'sophia.d@example.com',
    items: '2 items (T-Shirt, Jeans)',
    amount: '$149.00',
    status: 'Processing',
    date: 'Just now',
  },
  {
    id: 'ORD-8920',
    customer: 'Liam Johnson',
    email: 'liam.j@example.com',
    items: '1 item (Leather Jacket)',
    amount: '$210.00',
    status: 'Shipped',
    date: '2 hours ago',
  },
  {
    id: 'ORD-8919',
    customer: 'Emma Wilson',
    email: 'emma.w@example.com',
    items: '3 items (Sneakers, Cap)',
    amount: '$95.50',
    status: 'Delivered',
    date: 'Yesterday',
  },
  {
    id: 'ORD-8918',
    customer: 'Noah Martinez',
    email: 'noah.m@example.com',
    items: '1 item (Graphic Hoodie)',
    amount: '$78.00',
    status: 'Delivered',
    date: '2 days ago',
  },
];

const topProducts = [
  {
    name: 'Casual Slim Fit Denim',
    category: 'Jeans',
    price: '$89.00',
    sold: '64 sold',
    revenue: '$5,696',
    stock: 28,
  },
  {
    name: 'Oversized Cotton Tee',
    category: 'T-Shirts',
    price: '$35.00',
    sold: '112 sold',
    revenue: '$3,920',
    stock: 45,
  },
  {
    name: 'Classic Leather Bomber',
    category: 'Outerwear',
    price: '$180.00',
    sold: '18 sold',
    revenue: '$3,240',
    stock: 6,
  },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 sm:p-8 rounded-3xl bg-black text-white relative overflow-hidden shadow-lg">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 mb-3">
              <Sparkles size={12} className="text-amber-300" />
              <span>Merchant Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, Urban Threads Studio
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5 max-w-xl leading-relaxed">
              Here is your store summary for today. You have{' '}
              <span className="text-white font-bold">12 new orders</span> waiting to be fulfilled.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/provider/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-black text-xs sm:text-sm font-bold hover:bg-gray-100 transition-all active:scale-98 shadow-sm"
            >
              <Plus size={15} />
              <span>Add Product</span>
            </Link>
            <Link
              href="/dashboard/provider/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all border border-white/10"
            >
              <span>View Orders</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {stat.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700">
                  <Icon size={16} />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tight text-gray-950">
                  {stat.value}
                </span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} className="mr-0.5" />
                  {stat.change}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-950">Recent Store Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest customer purchases</p>
            </div>
            <Link
              href="/dashboard/provider/orders"
              className="text-xs font-semibold text-black hover:underline underline-offset-2 transition-all flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 overflow-x-auto">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="py-3.5 flex items-center justify-between gap-3 text-xs min-w-[340px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs shrink-0">
                    {order.customer.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-gray-900 truncate">{order.customer}</p>
                    <p className="text-[11px] text-gray-400 truncate">{order.items}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <p className="font-bold text-gray-900">{order.amount}</p>
                    <span className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                      <Clock size={10} />
                      {order.date}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'Shipped'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-950">Top Selling Products</h2>
              <p className="text-xs text-gray-400 mt-0.5">Best performers this month</p>
            </div>
            <Link
              href="/dashboard/provider/products"
              className="text-xs font-semibold text-black hover:underline underline-offset-2 transition-all flex items-center gap-1"
            >
              <span>Catalog</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 mt-1">
            {topProducts.map((product, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                    <p className="text-[11px] text-gray-400">{product.category}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-900">{product.revenue}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{product.sold}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Low Stock Warning Callout */}
          <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-amber-700" />
              <div>
                <p className="text-xs font-bold text-amber-900">2 products low in stock</p>
                <p className="text-[11px] text-amber-700">Restock recommended</p>
              </div>
            </div>
            <Link
              href="/dashboard/provider/products"
              className="text-xs font-bold text-amber-900 underline underline-offset-2 hover:text-black"
            >
              Restock
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

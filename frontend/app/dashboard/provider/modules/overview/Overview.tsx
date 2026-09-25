'use client';

import React, { useEffect, useState } from 'react';
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
  Loader2,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { getProviderOrders, OrderResponse } from '@/apis/orders.api';

export default function Overview() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const res = await getProviderOrders(1, 5);
        setOrders(res.data || []);
        setTotalOrders(res.total || 0);
      } catch (err) {
        console.error('Failed to load provider overview orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => {
    const orderSum = (order.items || []).reduce(
      (s, it) => s + (it.product?.price || 0) * (it.quantity || 1),
      0
    );
    return sum + orderSum;
  }, 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');

  const stats = [
    {
      title: 'Store Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: '+18.2%',
      isPositive: true,
      icon: DollarSign,
      subtitle: 'From processed orders',
    },
    {
      title: 'Total Orders',
      value: String(totalOrders),
      change: `+${orders.length} recent`,
      isPositive: true,
      icon: ShoppingBag,
      subtitle: `${pendingOrders.length} pending acceptance`,
    },
    {
      title: 'In Fulfillment',
      value: String(
        orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'SHIPPED').length
      ),
      change: 'Active',
      isPositive: true,
      icon: Truck,
      subtitle: 'Dispatched & Processing',
    },
    {
      title: 'Completed',
      value: String(orders.filter((o) => o.status === 'DELIVERED').length),
      change: '100% genuine',
      isPositive: true,
      icon: CheckCircle2,
      subtitle: 'Delivered to buyers',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-gray-950 via-gray-900 to-black p-6 sm:p-8 text-white shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-gray-200">
            <Sparkles size={13} className="text-amber-400" />
            <span>Storefront Manager Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Merchant Center & Order Pipeline
          </h1>

          <p className="text-xs sm:text-sm text-gray-300">
            Review live incoming customer orders, accept pending requests for rapid dispatch, and manage your catalog.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/provider/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs sm:text-sm font-bold hover:bg-gray-100 transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Add New Product</span>
            </Link>

            <Link
              href="/dashboard/provider/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all border border-white/10"
            >
              <span>Manage Orders ({totalOrders})</span>
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
              className="p-5 rounded-2xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {stat.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
                  <Icon size={16} />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white">
                  {stat.value}
                </span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} className="mr-0.5" />
                  {stat.change}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Orders & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white dark:bg-[#161922] p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-bold text-gray-950 dark:text-white">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Incoming store orders</p>
            </div>
            <Link
              href="/dashboard/provider/orders"
              className="text-xs font-semibold text-black dark:text-white hover:underline underline-offset-2 transition-all flex items-center gap-1"
            >
              <span>View all ({totalOrders})</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 size={24} className="animate-spin text-purple-600" />
              <p className="text-xs text-gray-400">Loading incoming orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShoppingBag size={32} className="mx-auto text-gray-400 opacity-60" />
              <p className="text-xs text-gray-500 font-semibold">No orders received yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.slice(0, 5).map((order) => {
                const orderAmount = (order.items || []).reduce(
                  (sum, it) => sum + (it.product?.price || 0) * (it.quantity || 1),
                  0
                );

                return (
                  <div
                    key={order.id}
                    className="py-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-gray-900 dark:text-white truncate">
                          {order.user?.name || order.user?.email || `Order #${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {order.items?.length || 0} items • {order.items?.[0]?.product?.name || 'Item'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${orderAmount.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                          <Clock size={10} />
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : order.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            : order.status === 'SHIPPED'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                            : order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Action Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#161922] p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-gray-950 dark:text-white">
              Fulfillment Actions
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quickly manage pending orders and customer dispatches.
            </p>

            <div className="pt-2 space-y-2">
              <Link
                href="/dashboard/provider/orders?status=PENDING"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-between hover:bg-amber-100 transition-colors"
              >
                <span>Pending Acceptance ({pendingOrders.length})</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/dashboard/provider/orders"
                className="w-full py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-between hover:opacity-90 transition-opacity"
              >
                <span>View Full Order Pipeline</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

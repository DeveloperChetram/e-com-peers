'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Package,
  Truck,
  Heart,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  CreditCard,
  User as UserIcon,
  Store,
} from 'lucide-react';
import { RootState } from '@/redux/store';
import { getMyOrders, OrderResponse } from '@/apis/orders.api';
import { selectFavorites } from '@/redux/slices/user.slice';
import { useAddresses } from '@/hooks/useAddresses';

export default function UserOverviewPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const favorites = useSelector(selectFavorites);
  const { addresses, selectedAddress } = useAddresses();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  const displayName = (user as any)?.name || 'Valued Shopper';
  const displayEmail = (user as any)?.email || 'customer@example.com';

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoadingOrders(true);
        const res = await getMyOrders(1, 5);
        setOrders(res.data || []);
        setTotalOrdersCount(res.total || 0);
      } catch (err) {
        console.error('Failed to load user overview orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOverview();
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'SHIPPED'
  );
  const latestActiveOrder = activeOrders[0] || orders[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-gray-200">
            <Sparkles size={13} className="text-amber-400" />
            <span>Welcome to your customer portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg">
            Track recent deliveries, review your order history, manage saved delivery addresses, and discover curated items for your style.
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-gray-100 transition-colors shadow-xs"
            >
              <ShoppingBag size={14} />
              <span>Browse Catalog</span>
            </Link>
            <Link
              href="/dashboard/user/orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors"
            >
              <span>View All Orders ({totalOrdersCount})</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-3">
            {totalOrdersCount}
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            Orders placed to date
          </span>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Active Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-3">
            {activeOrders.length} In Progress
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            Live fulfillment active
          </span>
        </div>

        {/* Saved Wishlist */}
        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Saved Wishlist</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Heart size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-3">
            {favorites.length} Items
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">Saved for later</span>
        </div>

        {/* Reward Loyalty */}
        <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Club Credits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-3">250 Pts</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            $12.50 reward discount
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Order Tracker & Order Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Live Shipment Card */}
          {latestActiveOrder ? (
            <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                      Order #{latestActiveOrder.id.slice(0, 12)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50">
                      {latestActiveOrder.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Placed on{' '}
                    {new Date(latestActiveOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Total Amount</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    $
                    {(latestActiveOrder.items || [])
                      .reduce((sum, it) => sum + (it.product?.price || 0) * (it.quantity || 1), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Shipment Progress Visual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Truck size={14} />
                    Current Status: {latestActiveOrder.status}
                  </span>
                  <span className="text-gray-400">
                    {latestActiveOrder.status === 'DELIVERED'
                      ? 'Completed'
                      : 'In Fulfillment Pipeline'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Order Placed', active: true },
                    {
                      label: 'Confirmed',
                      active:
                        latestActiveOrder.status === 'CONFIRMED' ||
                        latestActiveOrder.status === 'SHIPPED' ||
                        latestActiveOrder.status === 'DELIVERED',
                    },
                    {
                      label: 'Shipped',
                      active:
                        latestActiveOrder.status === 'SHIPPED' ||
                        latestActiveOrder.status === 'DELIVERED',
                    },
                    {
                      label: 'Delivered',
                      active: latestActiveOrder.status === 'DELIVERED',
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          step.active ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      />
                      <p
                        className={`text-[10px] font-medium truncate ${
                          step.active
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package preview items */}
              <div className="p-3.5 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {latestActiveOrder.items?.[0]?.product?.name || 'Order Items'}
                      {(latestActiveOrder.items?.length || 0) > 1 &&
                        ` + ${(latestActiveOrder.items?.length || 0) - 1} more`}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Deliver to: {latestActiveOrder.addressDetail || 'Customer Address'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/user/orders"
                  className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 shrink-0 transition-opacity"
                >
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161922] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-center space-y-3">
              <ShoppingBag size={32} className="mx-auto text-gray-400 opacity-60" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No orders placed yet
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Explore our curated catalog and place your first order today!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <ShoppingBag size={14} />
                <span>Shop Catalog</span>
              </Link>
            </div>
          )}

          {/* Recent Orders List Preview */}
          <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your recent purchases and fulfillment status.
                </p>
              </div>
              <Link
                href="/dashboard/user/orders"
                className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No purchase history found.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                {orders.slice(0, 3).map((order) => {
                  const orderTotal = (order.items || []).reduce(
                    (sum, it) => sum + (it.product?.price || 0) * (it.quantity || 1),
                    0
                  );

                  return (
                    <div
                      key={order.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                          <Package size={17} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {order.items?.[0]?.product?.name || 'Order Item'}
                              {(order.items?.length || 0) > 1 &&
                                ` (+${(order.items?.length || 0) - 1} items)`}
                            </p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            #{order.id.slice(0, 10)} •{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          ${orderTotal.toFixed(2)}
                        </span>
                        <Link
                          href="/dashboard/user/orders"
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Profile Card, Delivery Address & Quick Links */}
        <div className="space-y-6">
          {/* Account Profile Card */}
          <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserIcon size={18} />
                <span>My Profile</span>
              </h2>
              <Link
                href="/dashboard/user/profile"
                className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                Edit
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 space-y-2.5">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                  Full Name
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {displayName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                  Email Address
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                  {displayEmail}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 dark:border-gray-700">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck size={14} />
                  Active Shopper
                </span>
                <span className="text-[11px] text-gray-400">Verified Member</span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin size={18} className="text-red-500" />
                <span>Primary Address</span>
              </h2>
              <Link
                href="/dashboard/user/addresses"
                className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                Manage ({addresses.length})
              </Link>
            </div>

            {selectedAddress ? (
              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 space-y-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">{displayName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                    Default
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{selectedAddress.street}</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                </p>
                <p className="text-gray-400 text-[11px]">{selectedAddress.country}</p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2 text-xs">
                <p className="text-gray-400">No delivery address saved yet.</p>
                <Link
                  href="/dashboard/user/addresses"
                  className="inline-block px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Add Address
                </Link>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3 transition-colors">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Quick Shortcuts
            </h2>

            <div className="space-y-2">
              <Link
                href="/dashboard/user/wishlist"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Heart size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Saved Wishlist</p>
                    <p className="text-[11px] text-gray-400">
                      {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors"
                />
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      Browse New Arrivals
                    </p>
                    <p className="text-[11px] text-gray-400">Fresh styles just landed</p>
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

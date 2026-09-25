'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  ShoppingBag,
  Store,
  MapPin,
  Calendar,
  X,
  FileText,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getMyOrders, OrderResponse, OrderStatus } from '@/apis/orders.api';
import { resolveImages } from '@/apis/apiClient';
import { useCart } from '@/hooks/useCart';

export default function UserOrdersPage() {
  const { addItem } = useCart();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = filter !== 'ALL' ? (filter as OrderStatus) : undefined;
      const res = await getMyOrders(1, 50, statusParam);
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch user orders:', err);
      setError(err?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  // Client-side search filtering across order ID, items and address
  const filteredOrders = orders.filter((order) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const matchesId = order.id.toLowerCase().includes(query);
    const matchesAddress = order.addressDetail?.toLowerCase().includes(query);
    const matchesProvider = order.provider?.businessName?.toLowerCase().includes(query);
    const matchesItem = order.items?.some((it) => {
      const name = it.product?.name || '';
      return name.toLowerCase().includes(query);
    });
    return matchesId || matchesAddress || matchesProvider || matchesItem;
  });

  const formatAddressSnapshot = (detail?: string) => {
    if (!detail) return 'Standard Delivery Address';
    try {
      const parsed = JSON.parse(detail);
      return parsed.formatted || `${parsed.street}, ${parsed.city}, ${parsed.state} ${parsed.zip}, ${parsed.country}`;
    } catch {
      return detail;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50';
      case 'CONFIRMED':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50';
      case 'SHIPPED':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50';
      case 'DELIVERED':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50';
      case 'CANCELLED':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const handleReorder = (order: OrderResponse) => {
    if (!order.items) return;
    order.items.forEach((item) => {
      if (item.product) {
        addItem(
          {
            id: item.productId,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            slug: item.product.slug,
            providerId: order.providerId,
          },
          item.quantity
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Package size={28} className="text-purple-500" />
            <span>My Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track real-time delivery status, view detailed order receipts, and reorder favourite items.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, item, seller..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-xs font-semibold w-fit flex-wrap gap-1">
        {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
              filter === st
                ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {st === 'ALL' ? 'All Orders' : st.charAt(0) + st.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800">
          <Loader2 size={32} className="animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Loading your orders...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-800 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] p-16 rounded-3xl border border-gray-200/80 dark:border-gray-800 text-center shadow-xs">
          <Package size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-4">
            {search
              ? 'No orders match your search query.'
              : 'You have not placed any orders matching this category yet.'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <ShoppingBag size={14} />
            <span>Explore Products</span>
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderTotal = (order.items || []).reduce((sum, it) => {
              const price = it.product?.price || 0;
              return sum + price * (it.quantity || 1);
            }, 0);

            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden transition-colors"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-mono font-bold text-gray-950 dark:text-white">
                      #{order.id.slice(0, 12)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.provider?.businessName && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Store size={12} className="text-emerald-500" />
                        <span>Seller: <strong className="text-gray-800 dark:text-gray-200">{order.provider.businessName}</strong></span>
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-gray-950 dark:text-white">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {(order.items || []).map((item) => {
                      const img = item.product?.imageUrl
                        ? resolveImages(item.product.imageUrl)
                        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                      return (
                        <div
                          key={item.id}
                          className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/80 p-1.5 flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                              <Image
                                src={img}
                                alt={item.product?.name || 'Product'}
                                width={60}
                                height={60}
                                unoptimized
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <Link
                                href={`/products/${item.productId}`}
                                className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white hover:underline line-clamp-1"
                              >
                                {item.product?.name || 'Product Item'}
                              </Link>
                              <p className="text-[11px] text-gray-400">
                                Quantity: {item.quantity} • Unit Price: ${Number(item.product?.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white shrink-0">
                            ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 truncate">
                      <MapPin size={13} className="text-red-500 shrink-0" />
                      <span className="truncate">
                        Delivering to: <strong className="text-gray-800 dark:text-gray-200 font-medium">{formatAddressSnapshot(order.addressDetail)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={13} />
                        <span>Order Details</span>
                      </button>

                      <Link
                        href="/cart"
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-opacity text-xs flex items-center gap-1.5"
                      >
                        <ShoppingBag size={13} />
                        <span>Buy Again</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-950 dark:text-white">
                    Order Details
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  ID: {selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Purchased Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="text-xs">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {item.product?.name || 'Product Item'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Qty: {item.quantity} × ${Number(item.product?.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">
                    Shipping Address Snapshot
                  </span>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatAddressSnapshot(selectedOrder.addressDetail)}
                  </p>
                </div>
              </div>

              {selectedOrder.provider?.businessName && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700">
                  <Store size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Merchant Provider: <strong className="text-gray-900 dark:text-white">{selectedOrder.provider.businessName}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Total Price & Reorder Action */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[11px] text-gray-400 block">Total Amount</span>
                <span className="text-lg font-black text-gray-950 dark:text-white">
                  $
                  {(selectedOrder.items || [])
                    .reduce((sum, it) => sum + (it.product?.price || 0) * (it.quantity || 1), 0)
                    .toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/cart"
                  onClick={() => {
                    handleReorder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Buy Again</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

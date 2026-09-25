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
import {
  getMyOrders,
  requestCancelOrder,
  requestReturnOrder,
  getOrderTracking,
  OrderResponse,
  OrderStatus,
} from '@/apis/orders.api';
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

  // Tracking Modal State
  const [trackingOrder, setTrackingOrder] = useState<OrderResponse | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Return Request Modal State
  const [returnOrder, setReturnOrder] = useState<OrderResponse | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Cancel Request Modal State
  const [cancelOrder, setCancelOrder] = useState<OrderResponse | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

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

  // Open Tracking Modal
  const handleOpenTracking = async (order: OrderResponse) => {
    setTrackingOrder(order);
    try {
      setTrackingLoading(true);
      const data = await getOrderTracking(order.id);
      setTrackingData(data);
    } catch (err) {
      console.error('Failed to get tracking info:', err);
      setTrackingData(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Submit Cancel Request
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelOrder) return;
    try {
      setCancelSubmitting(true);
      const res = await requestCancelOrder(cancelOrder.id, cancelReason);
      setOrders((prev) =>
        prev.map((o) => (o.id === cancelOrder.id ? { ...o, status: res.order.status } : o))
      );
      setCancelOrder(null);
      setCancelReason('');
      setFeedback({
        message: 'Cancellation requested. Awaiting merchant approval.',
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to request cancellation:', err);
      alert(err?.message || 'Failed to submit cancellation request.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Submit Return Request
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrder) return;
    if (!returnReason.trim()) {
      alert('Please provide a reason for return.');
      return;
    }
    try {
      setReturnSubmitting(true);
      const res = await requestReturnOrder(returnOrder.id, returnReason);
      setOrders((prev) =>
        prev.map((o) => (o.id === returnOrder.id ? { ...o, status: res.order.status } : o))
      );
      setReturnOrder(null);
      setReturnReason('');
      setFeedback({
        message: 'Return requested successfully. The merchant will review your request.',
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to request return:', err);
      alert(err?.message || 'Failed to submit return request.');
    } finally {
      setReturnSubmitting(false);
    }
  };

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
      case 'CANCEL_REQUESTED':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50';
      case 'CANCELLED':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      case 'RETURN_REQUESTED':
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50';
      case 'RETURN_APPROVED':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50';
      case 'RETURNED':
      case 'REFUNDED':
        return 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50';
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
                    {/* <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {formattedDate}
                    </span> */}
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

                  {/* Return / Cancellation note if exists */}
                  {order.returnReason && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
                      <span className="font-bold">Return/Cancellation Note:</span> "{order.returnReason}"
                    </div>
                  )}

                  {/* Footer Bar */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 truncate">
                      <MapPin size={13} className="text-red-500 shrink-0" />
                      <span className="truncate">
                        Delivering to: <strong className="text-gray-800 dark:text-gray-200 font-medium">{formatAddressSnapshot(order.addressDetail)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Track Package Button */}
                      {order.status !== 'PENDING' && (
                        <button
                          onClick={() => handleOpenTracking(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold hover:bg-purple-100 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck size={13} />
                          <span>Track Package</span>
                        </button>
                      )}

                      {/* Request Cancel Button */}
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button
                          onClick={() => {
                            setCancelOrder(order);
                            setCancelReason('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition-colors text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <X size={13} />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      {/* Request Return Button */}
                      {order.status === 'DELIVERED' && (
                        <button
                          onClick={() => {
                            setReturnOrder(order);
                            setReturnReason('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-semibold transition-colors text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Return Item</span>
                        </button>
                      )}

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

      {/* Live Shipment Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Truck size={20} className="text-purple-600 dark:text-purple-400" />
                  <span>Package Tracking</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Order #{trackingOrder.id.slice(0, 12)}
                </p>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const shipmentsList: any[] =
                trackingData?.shipments && Array.isArray(trackingData.shipments) && trackingData.shipments.length > 0
                  ? trackingData.shipments
                  : trackingData?.shipment
                  ? [trackingData.shipment]
                  : [];

              if (trackingLoading) {
                return (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <Loader2 size={28} className="animate-spin text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-gray-500">Retrieving transit tracking updates...</p>
                  </div>
                );
              }

              if (!trackingData || shipmentsList.length === 0) {
                return (
                  <div className="py-10 text-center space-y-2">
                    <Package size={36} className="mx-auto text-gray-400 opacity-60" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Awaiting Shipment Dispatch</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      The merchant has accepted your order and is preparing items for dispatch. Tracking details will update here once departed.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {shipmentsList.map((shipment: any) => (
                    <div key={shipment.id} className="space-y-4">
                      {/* Shipment Meta */}
                      <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Tracking Code:</span>
                          <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                            {shipment.trackingNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Carrier:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {shipment.carrier || 'Standard Ground'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Current Status:</span>
                          <span className="font-bold text-purple-700 dark:text-purple-300">
                            {shipment.status}
                          </span>
                        </div>
                        {shipment.currentLocation && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Current Facility:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {shipment.currentLocation}
                            </span>
                          </div>
                        )}
                        {shipment.assignedStaff?.name && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Assigned Handler:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {shipment.assignedStaff.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Checkpoints Timeline */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Milestone History ({shipment.logs?.length || 0})
                        </h4>
                        {!shipment.logs || shipment.logs.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No checkpoint scans logged yet.</p>
                        ) : (
                          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800 max-h-56 overflow-y-auto pr-1">
                            {shipment.logs.map((log: any, idx: number) => (
                              <div key={log.id || idx} className="relative group text-xs space-y-0.5">
                                <div
                                  className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-[#161922] ${
                                    idx === 0 ? 'bg-purple-600' : 'bg-gray-400'
                                  }`}
                                />
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {log.status}
                                  </span>
                                  {log.location && (
                                    <span className="text-gray-500 font-medium">
                                      • {log.location}
                                    </span>
                                  )}
                                  {log.staff?.name && (
                                    <span className="text-gray-400 text-[10px]">
                                      (By {log.staff.name})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400 block">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                                {log.note && (
                                  <p className="text-gray-600 dark:text-gray-400 text-[11px] italic">
                                    "{log.note}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setTrackingOrder(null)}
                className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-950 dark:text-white">
                  Cancel Order
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Order #{cancelOrder.id.slice(0, 12)}
                </p>
              </div>
              <button
                onClick={() => setCancelOrder(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel this order? Your request will be forwarded to the merchant for immediate review.
              </p>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Placed order by mistake, changed shipping address..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelOrder(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Nevermind
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="px-5 py-2 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {cancelSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{cancelSubmitting ? 'Requesting...' : 'Confirm Cancellation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Order Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-950 dark:text-white">
                  Request Item Return
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Order #{returnOrder.id.slice(0, 12)}
                </p>
              </div>
              <button
                onClick={() => setReturnOrder(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <p className="text-gray-600 dark:text-gray-400">
                Please provide the reason for returning this item. Once approved by the merchant, our shipment team will guide the return transit and refund process.
              </p>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Size didn't fit, defective item, wrong color received..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnOrder(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="px-5 py-2 rounded-full bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {returnSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{returnSubmitting ? 'Submitting...' : 'Submit Return Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

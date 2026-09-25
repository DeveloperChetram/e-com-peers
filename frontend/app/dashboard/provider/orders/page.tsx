'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  Search,
  Check,
  X,
  Eye,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  MapPin,
  RefreshCw,
  ExternalLink,
  Send,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
  getProviderOrders,
  updateProviderOrderStatus,
  OrderResponse,
  OrderStatus,
} from '@/apis/orders.api';
import {
  getProviderStaff,
  moveToShipment,
  approveReturnOrCancel,
  processReturnReceipt,
  ProviderStaffMember,
} from '@/apis/provider.api';
import { resolveImages } from '@/apis/apiClient';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function ProviderOrdersPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isStaff = (user as any)?.role === 'PROVIDER_STAFF';

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Staff members for assignment
  const [staffMembers, setStaffMembers] = useState<ProviderStaffMember[]>([]);

  // Action loading state (per order ID)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  // Move to Shipment Modal State
  const [shipmentModalOrder, setShipmentModalOrder] = useState<OrderResponse | null>(null);
  const [shipmentSubmitting, setShipmentSubmitting] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    carrier: 'Standard Ground',
    trackingNumber: '',
    assignedStaffId: '',
    currentLocation: 'Main Distribution Hub',
    note: 'Order confirmed and departed to shipment facility.',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = filter !== 'ALL' ? (filter as OrderStatus) : undefined;
      const res = await getProviderOrders(1, 50, statusParam);
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch provider orders:', err);
      setError(err?.message || 'Failed to load merchant orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (isStaff) return;
    try {
      const data = await getProviderStaff();
      setStaffMembers(data || []);
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, [filter]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      setActionLoadingId(orderId);
      setActionFeedback(null);
      await updateProviderOrderStatus(orderId, status);

      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }

      setActionFeedback({
        id: orderId,
        message: `Order status updated to ${status}`,
        type: 'success',
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      setActionFeedback({
        id: orderId,
        message: err?.message || 'Failed to update order status.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Move to Shipment Modal
  const handleOpenShipmentModal = (order: OrderResponse) => {
    setShipmentModalOrder(order);
    const generatedTracking = `TRK-${Date.now().toString().slice(-8)}`;
    setShipmentForm({
      carrier: 'Standard Ground',
      trackingNumber: generatedTracking,
      assignedStaffId: staffMembers.length > 0 ? String(staffMembers[0].user?.id || '') : '',
      currentLocation: 'Main Distribution Hub',
      note: 'Order confirmed and departed to shipment facility.',
    });
  };

  // Submit Move to Shipment
  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentModalOrder) return;

    try {
      setShipmentSubmitting(true);
      await moveToShipment({
        orderId: shipmentModalOrder.id,
        trackingNumber: shipmentForm.trackingNumber || undefined,
        carrier: shipmentForm.carrier || undefined,
        assignedStaffId: shipmentForm.assignedStaffId ? Number(shipmentForm.assignedStaffId) : undefined,
        currentLocation: shipmentForm.currentLocation || undefined,
        note: shipmentForm.note || undefined,
      });

      // Update order locally to SHIPPED
      setOrders((prev) =>
        prev.map((o) => (o.id === shipmentModalOrder.id ? { ...o, status: 'SHIPPED' } : o))
      );

      if (selectedOrder && selectedOrder.id === shipmentModalOrder.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'SHIPPED' } : null));
      }

      setShipmentModalOrder(null);
      setActionFeedback({
        id: shipmentModalOrder.id,
        message: 'Order moved to Shipment Department successfully!',
        type: 'success',
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to move order to shipment:', err);
      alert(err?.message || 'Failed to move order to shipment department.');
    } finally {
      setShipmentSubmitting(false);
    }
  };

  // Approve / Reject Return or Cancel
  const handleApproveReturnOrCancel = async (orderId: string, approved: boolean) => {
    try {
      setActionLoadingId(orderId);
      setActionFeedback(null);
      const res = await approveReturnOrCancel(orderId, { approved });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: res.order.status } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: res.order.status } : null));
      }

      setActionFeedback({
        id: orderId,
        message: approved ? 'Request approved successfully.' : 'Request was rejected.',
        type: 'success',
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      console.error('Failed to process return approval:', err);
      setActionFeedback({
        id: orderId,
        message: err?.message || 'Failed to process request.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Process physically returned goods
  const handleProcessReturnReceipt = async (orderId: string, action: 'RETURNED' | 'REFUNDED') => {
    try {
      setActionLoadingId(orderId);
      setActionFeedback(null);
      const res = await processReturnReceipt(orderId, { action });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: res.order.status } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: res.order.status } : null));
      }

      setActionFeedback({
        id: orderId,
        message: action === 'RETURNED' ? 'Marked package received.' : 'Refund completed and order closed.',
        type: 'success',
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      console.error('Failed to process return receipt:', err);
      setActionFeedback({
        id: orderId,
        message: err?.message || 'Failed to update return status.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatAddressSnapshot = (detail?: string) => {
    if (!detail) return 'Standard Delivery Destination';
    try {
      const parsed = JSON.parse(detail);
      return (
        parsed.formatted ||
        `${parsed.street}, ${parsed.city}, ${parsed.state} ${parsed.zip}, ${parsed.country}`
      );
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
      case 'RETURN_REQUESTED':
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50';
      case 'RETURN_APPROVED':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50';
      case 'RETURNED':
      case 'REFUNDED':
        return 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50';
      case 'CANCELLED':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const matchesId = order.id.toLowerCase().includes(query);
    const matchesCustomer =
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query);
    const matchesItem = order.items?.some((it) =>
      it.product?.name?.toLowerCase().includes(query)
    );
    const matchesAddress = order.addressDetail?.toLowerCase().includes(query);

    return matchesId || matchesCustomer || matchesItem || matchesAddress;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED').length;
  const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <ShoppingBag size={28} className="text-purple-600 dark:text-purple-400" />
            <span>Store Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Accept or reject customer orders, monitor fulfillment pipelines, and update dispatch status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Total Orders</span>
            <Package size={16} className="text-gray-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-2">
            {total}
          </p>
          <span className="text-[11px] text-gray-400">All incoming orders</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <span>Pending Action</span>
            <Clock size={16} />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </p>
          <span className="text-[11px] text-amber-600/80">Requires acceptance</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 shadow-xs bg-blue-50/20">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <span>In Fulfillment</span>
            <Truck size={16} />
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {confirmedCount + shippedCount}
          </p>
          <span className="text-[11px] text-blue-600/80">Confirmed & Shipped</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Completed</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {deliveredCount}
          </p>
          <span className="text-[11px] text-emerald-600/80">Delivered successfully</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-xs font-semibold w-fit flex-wrap gap-1">
          {[
            'ALL',
            'PENDING',
            'CONFIRMED',
            'SHIPPED',
            'DELIVERED',
            'RETURN_REQUESTED',
            'CANCEL_REQUESTED',
            'RETURN_APPROVED',
            'CANCELLED',
          ].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                filter === st
                  ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'PENDING'
                ? `Pending (${pendingCount})`
                : st
                    .split('_')
                    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                    .join(' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer, item..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800">
          <Loader2 size={32} className="animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Loading provider orders...
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
            Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] p-16 rounded-3xl border border-gray-200/80 dark:border-gray-800 text-center shadow-xs">
          <ShoppingBag size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
            {search
              ? 'No merchant orders match your search query.'
              : 'There are no customer orders under this category at the moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderTotal = (order.items || []).reduce((sum, it) => {
              const price = it.product?.price || 0;
              return sum + price * (it.quantity || 1);
            }, 0);

            const isActionLoading = actionLoadingId === order.id;
            const feedback =
              actionFeedback && actionFeedback.id === order.id ? actionFeedback : null;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden transition-colors"
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-mono font-bold text-gray-950 dark:text-white">
                      #{order.id.slice(0, 12)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    {/* <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
                    {order.user && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <User size={13} className="text-purple-500" />
                        <span>Customer: <strong className="text-gray-800 dark:text-gray-200 font-semibold">{order.user.name || order.user.email}</strong></span>
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-gray-950 dark:text-white">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Card Body: Items */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {(order.items || []).map((item) => {
                      const img = item.product?.imageUrl
                        ? resolveImages(item.product.imageUrl)
                        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                      return (
                        <div
                          key={item.id}
                          className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/80 p-1 flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                              <Image
                                src={img}
                                alt={item.product?.name || 'Product'}
                                width={50}
                                height={50}
                                unoptimized
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                                {item.product?.name || 'Product item'}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                Quantity: <strong className="text-gray-800 dark:text-gray-200 font-semibold">{item.quantity}</strong> • Unit: ${Number(item.product?.price || 0).toFixed(2)}
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

                  {/* Feedback notification if any */}
                  {feedback && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        feedback.type === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  {/* Return / Cancel Reason if requested */}
                  {order.returnReason && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                      <RotateCcw size={15} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold">Customer Reason:</span>{' '}
                        <span>"{order.returnReason}"</span>
                      </div>
                    </div>
                  )}

                  {/* Card Footer: Address & Status Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 truncate">
                      <MapPin size={13} className="text-red-500 shrink-0" />
                      <span className="truncate">
                        Ship to: <strong className="text-gray-800 dark:text-gray-200 font-medium">{formatAddressSnapshot(order.addressDetail)}</strong>
                      </span>
                    </div>

                    {/* Order Acceptance, Rejection & Pipeline Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>

                      {/* 1. PENDING: Accept / Reject actions (Provider Only) */}
                      {order.status === 'PENDING' && (
                        isStaff ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
                            Awaiting Provider Acceptance
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-colors text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              {isActionLoading ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={13} className="stroke-[3]" />
                              )}
                              <span>Accept Order</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        )
                      )}

                      {/* 2. CONFIRMED: Move to Shipment Depart (Provider Only) */}
                      {order.status === 'CONFIRMED' && (
                        isStaff ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                            Awaiting Provider Dispatch Handoff
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenShipmentModal(order)}
                            disabled={isActionLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold transition-colors text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            <Truck size={13} />
                            <span>Move to Shipment Depart</span>
                            <ArrowRight size={13} />
                          </button>
                        )
                      )}

                      {/* 3. SHIPPED: Mark as Delivered */}
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          disabled={isActionLoading}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-colors text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          {isActionLoading ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      {/* 4. CANCEL_REQUESTED: Provider Approval Only */}
                      {order.status === 'CANCEL_REQUESTED' && (
                        isStaff ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50">
                            Pending Provider Approval
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApproveReturnOrCancel(order.id, true)}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              <span>Approve Cancel</span>
                            </button>
                            <button
                              onClick={() => handleApproveReturnOrCancel(order.id, false)}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <X size={13} />
                              <span>Decline Cancel</span>
                            </button>
                          </>
                        )
                      )}

                      {/* 5. RETURN_REQUESTED: Provider Approval Only */}
                      {order.status === 'RETURN_REQUESTED' && (
                        isStaff ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50">
                            Pending Provider Approval
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApproveReturnOrCancel(order.id, true)}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              <span>Approve Return</span>
                            </button>
                            <button
                              onClick={() => handleApproveReturnOrCancel(order.id, false)}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <X size={13} />
                              <span>Reject Return</span>
                            </button>
                          </>
                        )
                      )}

                      {/* 6. RETURN_APPROVED: Staff receives returned goods */}
                      {order.status === 'RETURN_APPROVED' && (
                        <>
                          <button
                            onClick={() => handleProcessReturnReceipt(order.id, 'RETURNED')}
                            disabled={isActionLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Package size={13} />}
                            <span>Confirm Goods Received</span>
                          </button>
                          <button
                            onClick={() => handleProcessReturnReceipt(order.id, 'REFUNDED')}
                            disabled={isActionLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            <span>Process Refund</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            {/* Header */}
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

            {/* Customer Info */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer Name:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedOrder.user?.name || 'Customer'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer Email:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedOrder.user?.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-700">
                <span className="text-gray-500 shrink-0">Shipping Snapshot:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 text-right">
                  {formatAddressSnapshot(selectedOrder.addressDetail)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Ordered Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="text-xs">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {item.product?.name || 'Product item'}
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

            {/* Modal Actions */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 block">Total Payable</span>
                <span className="text-lg font-black text-gray-950 dark:text-white">
                  $
                  {(selectedOrder.items || [])
                    .reduce((sum, it) => sum + (it.product?.price || 0) * (it.quantity || 1), 0)
                    .toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status === 'PENDING' && !isStaff && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                      className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                      className="px-4 py-2 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      Reject Order
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move to Shipment Depart Modal */}
      {shipmentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Truck size={20} className="text-purple-600 dark:text-purple-400" />
                  <span>Move to Shipment Depart</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Order #{shipmentModalOrder.id.slice(0, 12)} • {shipmentModalOrder.items?.length || 0} items
                </p>
              </div>
              <button
                onClick={() => setShipmentModalOrder(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleShipmentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Carrier / Logistics Partner
                  </label>
                  <input
                    type="text"
                    required
                    value={shipmentForm.carrier}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, carrier: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    required
                    value={shipmentForm.trackingNumber}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Assign Staff Member (Shipment Department)
                </label>
                <select
                  value={shipmentForm.assignedStaffId}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, assignedStaffId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  <option value="">-- No specific staff assigned --</option>
                  {staffMembers.map((st) => (
                    <option key={st.id} value={st.user?.id}>
                      {st.user?.name} ({st.user?.email}) - {st.role}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Assigned staff can track this package and log checkpoints from their shipment portal.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Departure Location / Origin Facility
                </label>
                <input
                  type="text"
                  required
                  value={shipmentForm.currentLocation}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, currentLocation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Dispatch Note / Checkpoint Entry
                </label>
                <textarea
                  rows={2}
                  value={shipmentForm.note}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, note: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShipmentModalOrder(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shipmentSubmitting}
                  className="px-5 py-2 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {shipmentSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{shipmentSubmitting ? 'Dispatching...' : 'Dispatch to Shipment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

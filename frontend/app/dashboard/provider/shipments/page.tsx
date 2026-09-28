'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  getProviderShipments,
  addShipmentLog,
  ShipmentItem,
  ShipmentLogItem,
} from '@/apis/provider.api';
import { ShipmentStatus } from '@/apis/orders.api';

export default function ProviderShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Expanded logs map (shipmentId -> boolean)
  const [expandedShipments, setExpandedShipments] = useState<Record<string, boolean>>({});

  // Checkpoint Log Modal
  const [activeShipmentForLog, setActiveShipmentForLog] = useState<ShipmentItem | null>(null);
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<{
    status: ShipmentStatus;
    location: string;
    note: string;
  }>({
    status: 'IN_TRANSIT',
    location: '',
    note: '',
  });

  // Action feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = filter !== 'ALL' ? filter : undefined;
      const data = await getProviderShipments({ status: statusParam });
      setShipments(data || []);
    } catch (err: any) {
      console.error('Failed to load shipments:', err);
      setError(err?.message || 'Failed to load shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [filter]);

  const toggleExpand = (id: string) => {
    setExpandedShipments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenLogModal = (shipment: ShipmentItem) => {
    setActiveShipmentForLog(shipment);
    setLogError(null);
    setLogForm({
      status: (shipment.status as ShipmentStatus) || 'IN_TRANSIT',
      location: shipment.currentLocation || '',
      note: '',
    });
  };

  const handleAddLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipmentForLog) return;

    try {
      setLogSubmitting(true);
      setLogError(null);

      const res = await addShipmentLog(activeShipmentForLog.id, {
        status: logForm.status,
        location: logForm.location.trim() || undefined,
        note: logForm.note.trim() || undefined,
      });

      const actualLog = res?.log;
      const updatedShipment = res?.shipment;

      // Update state locally
      setShipments((prev) =>
        prev.map((s) => {
          if (s.id === activeShipmentForLog.id) {
            if (updatedShipment) {
              return {
                ...s,
                ...updatedShipment,
                assignedStaff: updatedShipment.assignedStaff || s.assignedStaff,
                order: updatedShipment.order || s.order,
                logs: updatedShipment.logs || (actualLog ? [actualLog, ...(s.logs || [])] : s.logs),
              };
            }
            return {
              ...s,
              status: logForm.status,
              currentLocation: logForm.location || s.currentLocation,
              logs: actualLog ? [actualLog, ...(s.logs || [])] : s.logs,
            };
          }
          return s;
        })
      );

      // Auto expand to show the new log
      setExpandedShipments((prev) => ({ ...prev, [activeShipmentForLog.id]: true }));

      setActiveShipmentForLog(null);
      setFeedback({
        message: `Checkpoint logged successfully! Status set to ${logForm.status}.`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error('Failed to add checkpoint log:', err);
      setLogError(err?.message || 'Failed to record checkpoint.');
    } finally {
      setLogSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50';
      case 'DISPATCHED':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50';
      case 'IN_TRANSIT':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50';
      case 'OUT_FOR_DELIVERY':
        return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/50';
      case 'DELIVERED':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50';
      case 'RETURN_IN_TRANSIT':
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50';
      case 'RETURNED':
      case 'REFUNDED':
        return 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const filteredShipments = shipments.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.trackingNumber.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.carrier?.toLowerCase().includes(q) ||
      s.currentLocation?.toLowerCase().includes(q) ||
      s.assignedStaff?.name?.toLowerCase().includes(q)
    );
  });

  const inTransitCount = shipments.filter(
    (s) => s.status === 'IN_TRANSIT' || s.status === 'DISPATCHED' || s.status === 'OUT_FOR_DELIVERY'
  ).length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
  const returnsCount = shipments.filter(
    (s) => s.status === 'RETURN_IN_TRANSIT' || s.status === 'RETURNED' || s.status === 'REFUNDED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Truck size={28} className="text-purple-600 dark:text-purple-400" />
            <span>Shipment Department</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dispatch orders, track movement milestones, and record checkpoint logs as packages travel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchShipments}
            className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            title="Refresh Shipments"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>Total Shipments</span>
            <Package size={16} className="text-gray-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-2">
            {shipments.length}
          </p>
          <span className="text-[11px] text-gray-400">All registered shipments</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 shadow-xs bg-blue-50/20">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <span>In Transit</span>
            <Truck size={16} />
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {inTransitCount}
          </p>
          <span className="text-[11px] text-blue-600/80">Dispatched & en route</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Delivered</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {deliveredCount}
          </p>
          <span className="text-[11px] text-emerald-600/80">Completed deliveries</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 sm:p-5 rounded-2xl border border-orange-200/80 dark:border-orange-900/40 shadow-xs bg-orange-50/20">
          <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 font-semibold">
            <span>Returns & Claims</span>
            <Clock size={16} />
          </div>
          <p className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-2">
            {returnsCount}
          </p>
          <span className="text-[11px] text-orange-600/80">Return packages</span>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-xs font-semibold w-fit flex-wrap gap-1">
          {[
            'ALL',
            'DISPATCHED',
            'IN_TRANSIT',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'RETURN_IN_TRANSIT',
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
            placeholder="Search tracking #, order ID, carrier..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Shipments List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800">
          <Loader2 size={32} className="animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Loading shipments & logistics data...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-800 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchShipments}
            className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] p-16 rounded-3xl border border-gray-200/80 dark:border-gray-800 text-center shadow-xs">
          <Truck size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Shipments Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-4">
            {search
              ? 'No shipments match your search filter.'
              : 'There are no active shipments in this category. Accept an order and click "Move to Shipment Depart" to initiate.'}
          </p>
          <Link
            href="/dashboard/provider/orders"
            className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
          >
            View Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((shipment) => {
            const isExpanded = !!expandedShipments[shipment.id];
            const logs = shipment.logs || [];

            return (
              <div
                key={shipment.id}
                className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden transition-colors"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-mono font-black text-purple-700 dark:text-purple-400">
                      {shipment.trackingNumber}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      Order: #{shipment.orderId.slice(0, 10)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(
                        shipment.status
                      )}`}
                    >
                      {shipment.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      Carrier: {shipment.carrier || 'Standard Ground'}
                    </span>
                    {shipment.assignedStaff && (
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                        <User size={12} />
                        {shipment.assignedStaff.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Location, Date & Actions */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                        <MapPin size={15} className="text-red-500 shrink-0" />
                        <span>
                          Current Location:{' '}
                          <strong className="text-gray-950 dark:text-white font-bold">
                            {shipment.currentLocation || 'Departure Hub'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                        <Calendar size={13} />
                        <span>
                          Dispatched on{' '}
                          {shipment.startDate && !isNaN(new Date(shipment.startDate).getTime())
                            ? new Date(shipment.startDate).toLocaleString()
                            : 'Recently'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleOpenLogModal(shipment)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold transition-colors text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <PlusCircle size={14} />
                        <span>Log Checkpoint</span>
                      </button>

                      <button
                        onClick={() => toggleExpand(shipment.id)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Checkpoints ({logs.length})</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Checkpoints Timeline */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Log History & Milestone Tracking
                      </h4>

                      {logs.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No checkpoint logs recorded yet.</p>
                      ) : (
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                          {logs.map((log: any, idx: number) => {
                            const dateObj = log?.createdAt ? new Date(log.createdAt) : null;
                            const formattedDate =
                              dateObj && !isNaN(dateObj.getTime())
                                ? dateObj.toLocaleString()
                                : 'Just now';

                            return (
                              <div key={log.id || idx} className="relative group">
                                {/* Dot */}
                                <div
                                  className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-[#161922] ${
                                    idx === 0 ? 'bg-purple-600' : 'bg-gray-400'
                                  }`}
                                />
                                <div className="text-xs space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {log.status || 'CHECKPOINT'}
                                    </span>
                                    {log.location && (
                                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                                        at {log.location}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-400">
                                      {formattedDate}
                                    </span>
                                  </div>
                                  {log.note && (
                                    <p className="text-gray-600 dark:text-gray-400 italic text-[11px]">
                                      "{log.note}"
                                    </p>
                                  )}
                                  {log.staff?.name && (
                                    <p className="text-[10px] text-purple-600 dark:text-purple-400">
                                      Updated by {log.staff.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Checkpoint Modal */}
      {activeShipmentForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-950 dark:text-white">
                  Log Checkpoint Update
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Track: {activeShipmentForLog.trackingNumber}
                </p>
              </div>
              <button
                onClick={() => setActiveShipmentForLog(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {logError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle size={15} />
                <span>{logError}</span>
              </div>
            )}

            <form onSubmit={handleAddLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  New Status
                </label>
                <select
                  value={logForm.status}
                  onChange={(e) =>
                    setLogForm({ ...logForm, status: e.target.value as ShipmentStatus })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                >
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered (Completes Order)</option>
                  <option value="RETURN_IN_TRANSIT">Return In Transit</option>
                  <option value="RETURNED">Return Received</option>
                  <option value="REFUNDED">Refund Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Current Location / Facility
                </label>
                <input
                  type="text"
                  placeholder="e.g. Central Sorting Hub, Chicago IL"
                  value={logForm.location}
                  onChange={(e) => setLogForm({ ...logForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Checkpoint Note / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Arrived at distribution center, scheduled for delivery tomorrow."
                  value={logForm.note}
                  onChange={(e) => setLogForm({ ...logForm, note: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveShipmentForLog(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logSubmitting}
                  className="px-5 py-2 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {logSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{logSubmitting ? 'Recording...' : 'Save Checkpoint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

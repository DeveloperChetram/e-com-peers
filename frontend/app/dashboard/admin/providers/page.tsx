'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Store,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ShieldCheck,
  Power,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import {
  getAdminProviders,
  approveAdminProvider,
  rejectAdminProvider,
  updateAdminProviderStatus,
  deleteAdminProvider,
  AdminProvider,
} from '@/apis/admin.api';
import {
  setProviders,
  updateProviderInState,
  removeProviderFromState,
} from '@/redux/slices/admin.slice';
import { RootState } from '@/redux/store';

export default function AdminProvidersPage() {
  const dispatch = useDispatch();
  const { providers } = useSelector((state: RootState) => state.admin);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await getAdminProviders({
        search: search.trim() || undefined,
        status: statusFilter,
      });
      dispatch(setProviders(res.data || []));
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [search, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoadingId(id);
      await approveAdminProvider(id);
      dispatch(updateProviderInState({ id, status: 'APPROVED' }));
    } catch (err: any) {
      alert(err.message || 'Failed to approve provider');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoadingId(id);
      await rejectAdminProvider(id);
      dispatch(updateProviderInState({ id, status: 'REJECTED' }));
    } catch (err: any) {
      alert(err.message || 'Failed to reject provider');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (provider: AdminProvider) => {
    try {
      setActionLoadingId(provider.id);
      const nextActive = !provider.user.isActive;
      await updateAdminProviderStatus(provider.id, { isActive: nextActive });
      dispatch(
        updateProviderInState({
          id: provider.id,
          user: { ...provider.user, isActive: nextActive },
        }),
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update provider status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider profile? (Their user account role will be reverted to USER)')) {
      return;
    }
    try {
      setActionLoadingId(id);
      await deleteAdminProvider(id);
      dispatch(removeProviderFromState(id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete provider');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Store size={28} className="text-emerald-500" />
            <span>Merchant Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review store applications, oversee active sellers, and manage provider privileges.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-xs font-semibold">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-2xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores or owners..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-black dark:text-white" size={24} />
            <span className="text-xs font-semibold">Loading merchant directory...</span>
          </div>
        ) : providers.length === 0 ? (
          <div className="p-16 text-center">
            <Store size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Merchants Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              No provider accounts match your current search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Business Store</th>
                  <th className="py-3.5 px-6">Merchant Owner</th>
                  <th className="py-3.5 px-6">Application Status</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {providers.map((p) => {
                  const isPending = p.status === 'PENDING';
                  const isApproved = p.status === 'APPROVED';
                  const isRejected = p.status === 'REJECTED';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Store */}
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0 font-black text-xs">
                            {p.businessName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{p.businessName}</p>
                            <p className="text-[11px] text-gray-400 truncate max-w-xs">{p.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900 dark:text-white">{p.user?.name}</p>
                        <p className="text-[11px] text-gray-400">{p.user?.email}</p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                            <Clock size={11} />
                            Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                            <CheckCircle2 size={11} />
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/50">
                            <XCircle size={11} />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(p)}
                          disabled={actionLoadingId === p.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            p.user?.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                          title="Click to toggle user active status"
                        >
                          <Power size={11} />
                          {p.user?.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(p.id)}
                                disabled={actionLoadingId === p.id}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1"
                                title="Approve Provider Application"
                              >
                                <Check size={12} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(p.id)}
                                disabled={actionLoadingId === p.id}
                                className="px-2.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200 font-semibold text-[11px] transition-colors flex items-center gap-1"
                                title="Reject Application"
                              >
                                <X size={12} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={actionLoadingId === p.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Delete Provider Profile"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

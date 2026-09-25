'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Search,
  Check,
  X,
  Loader2,
  Store,
} from 'lucide-react';
import {
  getAdminProducts,
  approveAdminProduct,
  rejectAdminProduct,
  AdminProduct,
} from '@/apis/admin.api';
import {
  setProducts,
  updateProductInState,
  removeProductFromState,
} from '@/redux/slices/admin.slice';
import { RootState } from '@/redux/store';
import { resolveImages } from '@/apis/apiClient';

export default function AdminApprovalsPage() {
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.admin);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const res = await getAdminProducts({
        isApproved: false,
        search: search.trim() || undefined,
      });
      dispatch(setProducts(res.data || []));
    } catch (err) {
      console.error('Failed to load pending products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, [search]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoadingId(id);
      await approveAdminProduct(id);
      dispatch(removeProductFromState(id));
    } catch (err: any) {
      alert(err.message || 'Failed to approve product');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoadingId(id);
      await rejectAdminProduct(id);
      dispatch(removeProductFromState(id));
    } catch (err: any) {
      alert(err.message || 'Failed to reject product');
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
            <Clock size={28} className="text-amber-500" />
            <span>Product Approvals</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and approve seller product listings before they appear in the public catalog.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending items..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-black dark:text-white" size={24} />
            <span className="text-xs font-semibold">Loading pending approvals...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3 opacity-90" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Queue Empty</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              There are no merchant products currently waiting for admin review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 overflow-hidden relative">
                    {product.imageUrl ? (
                      <img
                        src={resolveImages(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                      Pending Review
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-md">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 pt-0.5">
                      <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                        <Store size={12} />
                        {product.provider?.businessName || 'Merchant'}
                      </span>
                      <span>•</span>
                      <span>Category: {product.category?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(product.id)}
                      disabled={actionLoadingId === product.id}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoadingId === product.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(product.id)}
                      disabled={actionLoadingId === product.id}
                      className="px-3 py-2 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

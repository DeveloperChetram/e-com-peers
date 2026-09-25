'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  X,
  Loader2,
  Store,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getAdminProducts,
  getAdminCategories,
  approveAdminProduct,
  rejectAdminProduct,
  deleteAdminProduct,
  AdminProduct,
  AdminCategory,
} from '@/apis/admin.api';
import {
  setProducts,
  updateProductInState,
  removeProductFromState,
} from '@/redux/slices/admin.slice';
import { RootState } from '@/redux/store';
import { resolveImages } from '@/apis/apiClient';

export default function AdminProductsCatalogPage() {
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.admin);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [categories, setCategoriesList] = useState<AdminCategory[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    getAdminCategories()
      .then((data) => setCategoriesList(data || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const isApprovedParam =
        approvalFilter === 'APPROVED'
          ? true
          : approvalFilter === 'PENDING'
          ? false
          : undefined;

      const res = await getAdminProducts({
        search: search.trim() || undefined,
        isApproved: isApprovedParam,
        categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      });
      dispatch(setProducts(res.data || []));
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, approvalFilter, categoryFilter]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoadingId(id);
      await approveAdminProduct(id);
      dispatch(updateProductInState({ id, isApproved: true }));
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
      dispatch(updateProductInState({ id, isApproved: false, isPublished: false }));
    } catch (err: any) {
      alert(err.message || 'Failed to reject product');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      setActionLoadingId(id);
      await deleteAdminProduct(id);
      dispatch(removeProductFromState(id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
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
            <Package size={28} className="text-blue-500" />
            <span>Product Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Global catalog oversight across all registered sellers and categories.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full text-xs text-gray-900 dark:text-white font-medium focus:outline-hidden focus:border-black dark:focus:border-white transition-colors cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c._count?.products ?? 0})
              </option>
            ))}
          </select>

          {/* Approval Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-xs font-semibold">
            {['ALL', 'APPROVED', 'PENDING'].map((f) => (
              <button
                key={f}
                onClick={() => setApprovalFilter(f)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  approvalFilter === f
                    ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-2xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
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
              placeholder="Search products..."
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
            <span className="text-xs font-semibold">Loading catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <Package size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Products Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              No catalog products match your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Provider</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Approval</th>
                  <th className="py-3.5 px-6">Visibility</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Product */}
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 overflow-hidden relative">
                          {p.imageUrl ? (
                            <img
                              src={resolveImages(p.imageUrl)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 font-normal">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Store size={12} className="text-emerald-500" />
                        {p.provider?.businessName || 'Merchant'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {p.category?.name || 'Uncategorized'}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      ${Number(p.price).toFixed(2)}
                    </td>

                    {/* Approval */}
                    <td className="py-4 px-6">
                      {p.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                          <CheckCircle2 size={11} />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                          <Clock size={11} />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Published */}
                    <td className="py-4 px-6">
                      {p.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <Eye size={12} />
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                          <EyeOff size={12} />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!p.isApproved ? (
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={actionLoadingId === p.id}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1"
                            title="Approve Listing"
                          >
                            <Check size={12} />
                            <span>Approve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={actionLoadingId === p.id}
                            className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 font-semibold text-[11px] transition-colors flex items-center gap-1"
                            title="Revoke Approval"
                          >
                            <X size={12} />
                            <span>Revoke</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={actionLoadingId === p.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

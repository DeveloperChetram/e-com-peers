'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  RefreshCw,
  LayoutGrid,
  List,
  AlertTriangle,
  X,
  ArrowUpDown,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  getMyProducts,
  getCategories,
  updateProduct,
  togglePublishProduct,
  deleteProduct,
  ProductItem,
  CategoryItem,
} from '@/apis/products.api';
import { resolveImages } from '@/apis/apiClient';

export default function ManageInventory() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'approved' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    description: string;
    price: number | string;
    categoryId: string;
    isPublished: boolean;
    imageFile: File | null;
  }>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isPublished: false,
    imageFile: null,
  });
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Alert/Toast State
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Toggle Publish loading state per item
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchInventory = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [productsData, categoriesData] = await Promise.all([
        getMyProducts(),
        getCategories(),
      ]);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      showNotification('error', err?.message || 'Could not load your inventory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (product.categoryId !== selectedCategory) return false;
      }

      // Status filter
      if (statusFilter === 'published' && !product.isPublished) return false;
      if (statusFilter === 'draft' && product.isPublished) return false;
      if (statusFilter === 'approved' && !product.isApproved) return false;
      if (statusFilter === 'pending' && product.isApproved) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  // Inventory stats
  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.isPublished).length;
    const drafts = total - published;
    const approved = products.filter((p) => p.isApproved).length;
    const pending = total - approved;
    return { total, published, drafts, approved, pending };
  }, [products]);

  // Handle Quick Toggle Publish
  const handleTogglePublish = async (product: ProductItem) => {
    const targetStatus = !product.isPublished;
    setTogglingId(product.id);

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isPublished: targetStatus } : p))
    );

    try {
      await togglePublishProduct(product.id, targetStatus);
      showNotification(
        'success',
        targetStatus
          ? `"${product.name}" is now marked as Published.`
          : `"${product.name}" was reverted to Draft.`
      );
    } catch (err: any) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isPublished: !targetStatus } : p))
      );
      showNotification('error', err?.message || 'Failed to update publication status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId: product.categoryId,
      isPublished: Boolean(product.isPublished),
      imageFile: null,
    });
    setEditImagePreview(product.imageUrl ? resolveImages(product.imageUrl) : '');
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name.trim());
      formData.append('description', editFormData.description.trim());
      formData.append('price', String(Number(editFormData.price)));
      formData.append('categoryId', editFormData.categoryId);
      formData.append('isPublished', String(editFormData.isPublished));

      if (editFormData.imageFile) {
        formData.append('image', editFormData.imageFile);
      }

      const updated = await updateProduct(editingProduct.id, formData);

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updated } : p))
      );

      showNotification('success', `Product "${editFormData.name}" updated successfully.`);
      setEditingProduct(null);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update product.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);

    try {
      await deleteProduct(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      showNotification('success', `Product "${deletingProduct.name}" removed from inventory.`);
      setDeletingProduct(null);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : 'bg-red-950 text-red-100 border-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Package size={28} className="text-black dark:text-white" />
            <span>Product Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your store merchandise, publish statuses, pricing, and approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchInventory(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161922] hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh inventory"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/dashboard/provider/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#161922] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Total Listed</span>
            <Package size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{stats.total}</p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">All registered items</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span>Published</span>
            <Eye size={16} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats.published}</p>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Ready for buyers</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Drafts</span>
            <EyeOff size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-black text-gray-600 dark:text-gray-400 mt-2">{stats.drafts}</p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Unpublished</span>
        </div>

        <div className="bg-white dark:bg-[#161922] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-semibold">
            <span>Admin Approved</span>
            <CheckCircle2 size={16} className="text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">{stats.approved}</p>
          <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-medium">Verified by SHOP.CO</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/70 dark:border-amber-800/40 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs font-semibold">
            <span>Pending Review</span>
            <Clock size={16} className="text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">{stats.pending}</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-500 font-medium">Awaiting admin review</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#161922] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title or description..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[150px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by Category"
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none cursor-pointer font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ArrowUpDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#161922] shadow-2xs text-black dark:text-white font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#161922] shadow-2xs text-black dark:text-white font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-gray-100 dark:border-gray-800 pt-2 text-xs">
          <span className="text-gray-400 dark:text-gray-500 font-semibold px-2">Status:</span>
          {(
            [
              { key: 'all', label: 'All Products', count: stats.total },
              { key: 'published', label: 'Published', count: stats.published },
              { key: 'draft', label: 'Drafts', count: stats.drafts },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'pending', label: 'Pending Review', count: stats.pending },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.key
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-16 text-center">
          <RefreshCw size={28} className="animate-spin mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Loading your inventory...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
            <Package size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No matching products found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search query or clear the active status filter.'
                : 'Start listing products into your provider inventory to begin selling.'}
            </p>
          </div>
          {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStatusFilter('all');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              href="/dashboard/provider/products/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xs"
            >
              <Plus size={15} />
              <span>Add Your First Product</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#161922] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-center">Publication</th>
                  <th className="py-3 px-4 text-center">Admin Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredProducts.map((product) => {
                  const resolvedImg = product.imageUrl ? resolveImages(product.imageUrl) : '';
                  const isToggling = togglingId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {resolvedImg ? (
                              <Image
                                src={resolvedImg}
                                alt={product.name}
                                width={48}
                                height={48}
                                unoptimized
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <Package size={20} className="text-gray-300 dark:text-gray-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[200px] sm:max-w-xs">
                              {product.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[11px]">
                          <Tag size={11} className="text-gray-400" />
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        ${Number(product.price).toFixed(2)}
                      </td>

                      {/* Publication Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(product)}
                            disabled={isToggling}
                            title={
                              product.isPublished
                                ? 'Click to unpublish / move to draft'
                                : 'Click to publish to catalog'
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              product.isPublished ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                            } ${isToggling ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                product.isPublished ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-bold ${
                              product.isPublished ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {product.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </td>

                      {/* Admin Approval Status */}
                      <td className="py-3.5 px-4 text-center">
                        {product.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                            <Clock size={12} className="text-amber-600 dark:text-amber-400" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const resolvedImg = product.imageUrl ? resolveImages(product.imageUrl) : '';
            const isToggling = togglingId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-[#161922] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="w-full h-44 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden relative mb-3">
                    {resolvedImg ? (
                      <Image
                        src={resolvedImg}
                        alt={product.name}
                        width={180}
                        height={180}
                        unoptimized
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <Package size={40} className="text-gray-300 dark:text-gray-600" />
                    )}

                    {/* Top status pills */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold backdrop-blur-xs">
                          <CheckCircle2 size={10} />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold backdrop-blur-xs">
                          <Clock size={10} />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Category */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {product.category?.name || 'Catalog'}
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mt-0.5" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-1">
                    {product.description || 'No description added'}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  {/* Toggle publish button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(product)}
                      disabled={isToggling}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        product.isPublished ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          product.isPublished ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      {product.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingProduct(product)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#161922] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-black dark:text-white" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Product</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={editFormData.categoryId}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white outline-none cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image upload and preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Product Image (Optional replacement)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                    {editImagePreview ? (
                      <Image
                        src={editImagePreview}
                        alt="Preview"
                        width={64}
                        height={64}
                        unoptimized
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Package size={24} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditFormData((prev) => ({ ...prev, imageFile: file }));
                        setEditImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/80 dark:border-gray-700">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Publish Immediately</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    If enabled, this product is published to the catalog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditFormData((prev) => ({ ...prev, isPublished: !prev.isPublished }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    editFormData.isPublished ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      editFormData.isPublished ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161922] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-950 dark:text-white">Delete Product?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-gray-900 dark:text-white">"{deletingProduct.name}"</strong>? This will remove
                it from your active catalog and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

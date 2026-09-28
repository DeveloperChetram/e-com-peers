'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  FolderTree,
  ExternalLink,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Store,
  Tag,
  AlertCircle,
  X,
  Loader2,
  Filter,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminCategoryProducts,
  getAdminProducts,
  AdminCategory,
  AdminProduct,
} from '@/apis/admin.api';
import {
  setCategories,
  addCategoryToState,
  updateCategoryInState,
  removeCategoryFromState,
} from '@/redux/slices/admin.slice';
import { RootState } from '@/redux/store';
import { resolveImages } from '@/apis/apiClient';

export default function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const { categories } = useSelector((state: RootState) => state.admin);

  // View mode: 'categories' (table/management) or 'products' (category-wise product browser)
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // Search & Filter
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [productVisibilityFilter, setProductVisibilityFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Category-wise products list
  const [categoryProducts, setCategoryProducts] = useState<AdminProduct[]>([]);

  // Create / Edit Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Modal State
  const [deletingCategory, setDeletingCategory] = useState<AdminCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Helper to generate slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAdminCategories();
      dispatch(setCategories(data || []));
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch category-wise products when in 'products' tab or when selectedCategoryId changes
  const fetchCategoryProducts = async () => {
    try {
      setProductsLoading(true);
      if (selectedCategoryId === 'ALL') {
        const res = await getAdminProducts({
          search: productSearch.trim() || undefined,
          isApproved:
            productStatusFilter === 'APPROVED'
              ? true
              : productStatusFilter === 'PENDING'
              ? false
              : undefined,
          isPublished:
            productVisibilityFilter === 'PUBLISHED'
              ? true
              : productVisibilityFilter === 'DRAFT'
              ? false
              : undefined,
        });
        setCategoryProducts(res.data || []);
      } else {
        const res = await getAdminCategoryProducts(selectedCategoryId, {
          search: productSearch.trim() || undefined,
          isApproved:
            productStatusFilter === 'APPROVED'
              ? true
              : productStatusFilter === 'PENDING'
              ? false
              : undefined,
          isPublished:
            productVisibilityFilter === 'PUBLISHED'
              ? true
              : productVisibilityFilter === 'DRAFT'
              ? false
              : undefined,
        });
        setCategoryProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load category products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchCategoryProducts();
    }
  }, [activeTab, selectedCategoryId, productSearch, productStatusFilter, productVisibilityFilter]);

  // Handle open create modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setAutoSlug(true);
    setFormError(null);
  };

  // Handle open edit modal
  const handleOpenEdit = (cat: AdminCategory) => {
    setModalMode('edit');
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setAutoSlug(false);
    setFormError(null);
  };

  // Handle form name change with auto-slug
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (autoSlug) {
      setFormSlug(generateSlug(val));
    }
  };

  // Submit create or edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required');
      return;
    }

    const finalSlug = formSlug.trim() || generateSlug(formName);

    try {
      setActionLoading(true);
      setFormError(null);

      if (modalMode === 'create') {
        const newCat = await createAdminCategory({
          name: formName.trim(),
          slug: finalSlug,
        });
        dispatch(addCategoryToState(newCat));
      } else if (modalMode === 'edit' && editingCategory) {
        const updatedCat = await updateAdminCategory(editingCategory.id, {
          name: formName.trim(),
          slug: finalSlug,
        });
        dispatch(updateCategoryInState(updatedCat));
      }

      setModalMode(null);
      // Refresh list to update any backend counters
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setActionLoading(true);
      setDeleteError(null);
      await deleteAdminCategory(deletingCategory.id);
      dispatch(removeCategoryFromState(deletingCategory.id));
      if (selectedCategoryId === deletingCategory.id) {
        setSelectedCategoryId('ALL');
      }
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered categories for Management Tab
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  // Stats calculation
  const totalCategories = categories.length;
  const totalProductsInCategories = categories.reduce(
    (acc, curr) => acc + (curr._count?.products || 0),
    0
  );
  const activeCategoriesCount = categories.filter(
    (c) => (c._count?.products || 0) > 0
  ).length;
  const emptyCategoriesCount = totalCategories - activeCategoriesCount;

  // Selected Category details for header
  const currentCategoryDetail = useMemo(() => {
    if (selectedCategoryId === 'ALL') return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                Category Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Organize store departments, manage category slugs, and inspect category-wise products.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl text-xs font-bold border border-gray-200/80 dark:border-gray-700/80">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FolderTree size={14} />
              <span>Categories ({totalCategories})</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Package size={14} />
              <span>Category Products</span>
            </button>
          </div>

          {/* Add Category Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Categories
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <Layers size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">
            {totalCategories}
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
            Across global store catalog
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Categorized Products
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">
            {totalProductsInCategories}
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
            Live items filed in categories
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Active Departments
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {activeCategoriesCount}
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
            Has 1 or more products linked
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Empty Categories
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
              <AlertCircle size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {emptyCategoriesCount}
          </p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
            Available for new listings
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CATEGORIES MANAGEMENT TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#161922] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories by name or slug..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-2xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Showing {filteredCategories.length} categories</span>
              <button
                onClick={fetchCategories}
                title="Refresh Categories"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-colors">
            {loading ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-black dark:text-white" size={24} />
                <span className="text-xs font-semibold">Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-16 text-center">
                <Layers size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No Categories Found
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                  {categorySearch
                    ? 'No categories match your search. Try another keyword.'
                    : 'Get started by creating your first product category.'}
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold"
                >
                  <Plus size={14} />
                  <span>Create Category</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Slug</th>
                      <th className="py-3.5 px-6">Product Count</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredCategories.map((cat) => {
                      const count = cat._count?.products || 0;
                      return (
                        <tr
                          key={cat.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          {/* Name */}
                          <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <Tag size={16} />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white block">
                                  {cat.name}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                                  ID: {cat.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Slug */}
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60">
                              /{cat.slug}
                            </span>
                          </td>

                          {/* Product Count & Link to Products View */}
                          <td className="py-4 px-6">
                            <button
                              onClick={() => {
                                setSelectedCategoryId(cat.id);
                                setActiveTab('products');
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer group"
                              title="Click to view all products in this category"
                            >
                              <Package size={13} />
                              <span>{count} {count === 1 ? 'Product' : 'Products'}</span>
                              <ArrowRight
                                size={12}
                                className="group-hover:translate-x-0.5 transition-transform"
                              />
                            </button>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            {count > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                Empty
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Products */}
                              <button
                                onClick={() => {
                                  setSelectedCategoryId(cat.id);
                                  setActiveTab('products');
                                }}
                                title="View category products"
                                className="p-1.5 rounded-lg text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <ExternalLink size={15} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEdit(cat)}
                                title="Edit category"
                                className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  setDeletingCategory(cat);
                                  setDeleteError(null);
                                }}
                                title={
                                  count > 0
                                    ? 'Cannot delete: category has associated products'
                                    : 'Delete category'
                                }
                                className={`p-1.5 rounded-lg transition-colors ${
                                  count > 0
                                    ? 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                                }`}
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
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CATEGORY-WISE PRODUCT BROWSER */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Category Horizontal Filter Pills */}
          <div className="bg-white dark:bg-[#161922] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Filter size={14} className="text-purple-500" />
                Select Category to Filter Catalog:
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {categories.length} categories available
              </span>
            </div>

            {/* Scrollable Pills Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {/* 'All' Pill */}
              <button
                onClick={() => setSelectedCategoryId('ALL')}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategoryId === 'ALL'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span>All Categories</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategoryId === 'ALL'
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {totalProductsInCategories}
                </span>
              </button>

              {/* Individual Category Pills */}
              {categories.map((c) => {
                const isSelected = selectedCategoryId === c.id;
                const count = c._count?.products || 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Category Banner & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#161922] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
            {/* Category Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Tag size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {currentCategoryDetail ? currentCategoryDetail.name : 'All Product Categories'}
                  </h2>
                  {currentCategoryDetail && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60">
                      /{currentCategoryDetail.slug}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentCategoryDetail
                    ? `Showing all products filed under "${currentCategoryDetail.name}".`
                    : 'Showing global product catalog across all categories.'}
                </p>
              </div>
            </div>

            {/* Search & Sub-filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Approval status filter */}
              <div className="flex bg-gray-100 dark:bg-gray-800/80 p-0.5 rounded-xl text-xs font-semibold">
                {(['ALL', 'APPROVED', 'PENDING'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setProductStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      productStatusFilter === st
                        ? 'bg-white dark:bg-[#161922] text-black dark:text-white shadow-2xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All Approvals' : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Product search within category */}
              <div className="relative w-full sm:w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter products..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={fetchCategoryProducts}
                title="Refresh product list"
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <RefreshCw size={14} className={productsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Category Products Table */}
          <div className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden transition-colors">
            {productsLoading ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-black dark:text-white" size={24} />
                <span className="text-xs font-semibold">Loading category products...</span>
              </div>
            ) : categoryProducts.length === 0 ? (
              <div className="p-16 text-center">
                <Package size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No Products in this Category
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                  {currentCategoryDetail
                    ? `No products have been categorized under "${currentCategoryDetail.name}" yet.`
                    : 'No products match your search or filter criteria.'}
                </p>
                {selectedCategoryId !== 'ALL' && (
                  <button
                    onClick={() => setSelectedCategoryId('ALL')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    View All Categories
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-3.5 px-6">Product</th>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Merchant / Store</th>
                      <th className="py-3.5 px-6">Price</th>
                      <th className="py-3.5 px-6">Approval</th>
                      <th className="py-3.5 px-6">Storefront Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {categoryProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        {/* Product info */}
                        <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden relative border border-gray-200/50 dark:border-gray-700/50">
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
                            <div className="min-w-0">
                              <span className="text-sm font-bold text-gray-900 dark:text-white block truncate">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1">
                                {p.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                            <Tag size={12} />
                            <span>{p.category?.name || 'Unassigned'}</span>
                          </span>
                        </td>

                        {/* Provider */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
                            <Store size={14} className="text-gray-400" />
                            <span>{p.provider?.businessName || 'System Catalog'}</span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                          ${Number(p.price).toFixed(2)}
                        </td>

                        {/* Approval Status */}
                        <td className="py-4 px-6">
                          {p.isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={12} />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                              <Clock size={12} />
                              Pending Approval
                            </span>
                          )}
                        </td>

                        {/* Visibility */}
                        <td className="py-4 px-6">
                          {p.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                              <Eye size={11} />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              <EyeOff size={11} />
                              Draft
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT CATEGORY */}
      {/* ========================================================================= */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#161922] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {modalMode === 'create'
                      ? 'Add a department to categorize products across the marketplace'
                      : `Update details for "${editingCategory?.name}"`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Footwear, Electronics, Home Decor..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Slug Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    URL Slug
                  </label>
                  {modalMode === 'create' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAutoSlug(!autoSlug);
                        if (!autoSlug) {
                          setFormSlug(generateSlug(formName));
                        }
                      }}
                      className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {autoSlug ? 'Customize slug' : 'Auto generate'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400">
                    /
                  </span>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormSlug(e.target.value);
                    }}
                    placeholder="footwear"
                    className="w-full pl-6 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Used in storefront URLs and catalog filters (e.g. /category/{formSlug || 'slug'})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : modalMode === 'create' ? (
                    <Plus size={14} />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>{modalMode === 'create' ? 'Create Category' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CATEGORY CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#161922] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Delete Category
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Confirm removal of &quot;{deletingCategory.name}&quot;
                </p>
              </div>
            </div>

            {/* Error Message */}
            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Warning if category has products */}
            {(deletingCategory._count?.products || 0) > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  Category Contains Products
                </p>
                <p className="text-[11px] leading-relaxed">
                  This category currently has <strong>{deletingCategory._count?.products} product(s)</strong> attached. You must first reassign or delete these products before deleting this category.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setDeletingCategory(null);
                  setDeleteError(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={actionLoading || (deletingCategory._count?.products || 0) > 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actionLoading && <Loader2 size={13} className="animate-spin" />}
                <span>Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

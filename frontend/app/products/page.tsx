'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  User,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  X,
  RotateCcw,
  Truck,
  ShieldCheck,
  RefreshCw,
  Award,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import ProductCard, { Product } from '@/components/ui/ProductCard';
import { getAllProducts, getCategories, CategoryItem } from '@/apis/products.api';
import { ThemeToggle } from '@/components/ThemeProvider';
import DashboardButton from '@/components/ui/DashboardButton';
import { useCart } from '@/hooks/useCart';

export default function ProductsPage() {
  const { totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getCategories(),
        ]);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Failed to load products or categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSortBy('featured');
    setMaxPrice(1000);
  };

  // Filter & Sort Computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q),
      );
    }

    // Category Filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          p.category?.id === selectedCategory ||
          p.category?.name.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Price Filter
    result = result.filter((p) => Number(p.price || 0) <= maxPrice);

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchQuery, selectedCategory, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0B0D13] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* ========================================================= */}
      {/* 1. TOP STORE NAVBAR                                       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#161922]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-gray-950 dark:text-white"
            >
              SHOP.CO
            </Link>

            <nav className="hidden lg:flex items-center space-x-6 text-xs sm:text-sm font-semibold">
              <Link
                href="/products"
                className="text-black dark:text-white font-bold transition-colors"
              >
                Catalog
              </Link>
              <Link
                href="/register?role=provider"
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Become a Seller
              </Link>
              <Link
                href="/dashboard/user"
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                My Account
              </Link>
            </nav>
          </div>

          {/* Center Search Input */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, category, or brand..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-all"
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

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Shopping Bag Button */}
            <Link
              href="/cart"
              aria-label="Shopping Bag"
              className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-black flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <Link
              href="/login"
              aria-label="User Profile"
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <User size={20} />
            </Link>

            {/* Dashboard Button */}
            <DashboardButton />
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden"
            />
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. CATALOG HERO HEADER                                     */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900/40 dark:to-transparent border-b border-gray-100 dark:border-gray-800/80 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-bold">Catalog</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-semibold mb-2">
                <Sparkles size={13} className="text-amber-500" />
                <span>Verified Quality & Certified Merchants</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 dark:text-white">
                Explore Products
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mt-1 leading-relaxed">
                Discover modern garments, premium electronics, and bespoke accessories. All listings verified and approved by platform governance.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-2xs">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FILTER & TOOLBAR SECTION                                */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-2 justify-between lg:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-400 hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 rounded-full pl-3.5 pr-8 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-hidden cursor-pointer shadow-2xs"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                />
              </div>
            </div>

            {/* Price Filter Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#161922] border border-gray-200 dark:border-gray-800 text-xs font-semibold shadow-2xs">
              <span className="text-gray-400">Max:</span>
              <span className="font-bold">${maxPrice}</span>
              <input
                type="range"
                min="20"
                max="1000"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 accent-black dark:accent-white cursor-pointer"
              />
            </div>

            {/* Reset Filters button if modified */}
            {(selectedCategory !== 'ALL' || searchQuery || sortBy !== 'featured' || maxPrice < 1000) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Reset all active filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PRODUCT GRID DISPLAY                                    */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[500px]">
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#161922] rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 space-y-4 animate-pulse"
              >
                <div className="w-full h-56 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-3/4 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-3 w-1/2 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-16 rounded-md bg-gray-100 dark:bg-gray-800" />
                  <div className="h-8 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty Search State */
          <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center text-gray-400">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No matching products found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              We couldn't find any products matching your active filters. Try adjusting your search keyword, category, or price range.
            </p>
            <div className="pt-2">
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          /* Active Product Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 5. TRUST GUARANTEE BANNER                                 */}
      {/* ========================================================= */}
      <section className="bg-gray-50 dark:bg-[#12141c] border-t border-b border-gray-100 dark:border-gray-800/80 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Fast & Free Delivery
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Complimentary standard shipping on all qualifying orders over $50.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Certified Merchants
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All marketplace sellers pass admin verification and catalog reviews.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <RefreshCw size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  30-Day Hassle Returns
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Simple and flexible returns if you're not completely satisfied.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  100% Authentic Guarantee
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Direct merchant sourcing guarantees genuine quality with every item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. STORE FOOTER                                           */}
      {/* ========================================================= */}
      <footer className="bg-white dark:bg-[#161922] py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div>
            <div className="text-2xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
              SHOP.CO
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              We curate versatile clothing and lifestyle collections designed to elevate your everyday confidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors">
              Products
            </Link>
            <Link href="/register?role=provider" className="hover:text-black dark:hover:text-white transition-colors">
              Sell on SHOP.CO
            </Link>
            <Link href="/dashboard/user" className="hover:text-black dark:hover:text-white transition-colors">
              Customer Portal
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-4">
          <p>© 2026 SHOP.CO Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
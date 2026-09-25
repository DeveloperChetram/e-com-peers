'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Award,
  Store,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  ArrowLeft,
  Sparkles,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { getProductById, getAllProducts, ProductItem } from '@/apis/products.api';
import { resolveImages } from '@/apis/apiClient';
import { ThemeToggle } from '@/components/ThemeProvider';
import DashboardButton from '@/components/ui/DashboardButton';
import ProductCard from '@/components/ui/ProductCard';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { addItem, totalItems } = useCart();
  const { isFavorite, toggle: toggleFav } = useFavorites();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive UI states
  const [selectedColor, setSelectedColor] = useState('Onyx Black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isFav = product ? isFavorite(String(product.id)) : false;

  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);

        // Fetch related products from the same category or catalog
        const all = await getAllProducts();
        if (Array.isArray(all)) {
          setRelatedProducts(all.filter((p) => p.id !== id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const success = addItem(
      {
        id: String(product.id),
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        providerId: String(product.providerId || product.provider?.id || ''),
        categoryId: String(product.categoryId || product.category?.id || ''),
        slug: product.slug,
      },
      quantity
    );
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const colors = [
    { name: 'Onyx Black', bg: 'bg-neutral-900 border-neutral-700' },
    { name: 'Slate Grey', bg: 'bg-slate-500 border-slate-400' },
    { name: 'Pure White', bg: 'bg-white border-gray-300' },
    { name: 'Deep Navy', bg: 'bg-sky-950 border-sky-800' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Computed images for gallery preview
  const primaryImage = product?.imageUrl
    ? resolveImages(product.imageUrl)
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const galleryImages = [
    primaryImage,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ];

  const currentDisplayImage = galleryImages[selectedImageIndex] || primaryImage;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0B0D13] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* ========================================================= */}
      {/* 1. TOP STORE NAVBAR                                       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#161922]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {/* Bag Icon */}
            <Link
              href="/cart"
              aria-label="Shopping Bag"
              className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-black flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            <DashboardButton />
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BREADCRUMBS & NAVIGATION                                */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors shrink-0">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors shrink-0">
              Catalog
            </Link>
            {product?.category?.name && (
              <>
                <span>/</span>
                <span className="text-gray-600 dark:text-gray-300 shrink-0">
                  {product.category.name}
                </span>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-xs">
              {product?.name || 'Loading...'}
            </span>
          </div>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN PRODUCT SHOWCASE SECTION                           */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {loading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 animate-pulse">
            <div className="h-[450px] sm:h-[550px] rounded-3xl bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-6 py-4">
              <div className="h-6 w-1/4 rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="h-10 w-3/4 rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-8 w-1/3 rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-24 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-12 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        ) : !product ? (
          /* Not Found */
          <div className="text-center py-20 max-w-md mx-auto space-y-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Product Not Found</h2>
            <p className="text-sm text-gray-500">
              The product you are looking for is either no longer available or awaiting catalog publication.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* --------------------------------------------- */}
            {/* LEFT: GALLERY SHOWCASE                        */}
            {/* --------------------------------------------- */}
            <div className="space-y-4">
              {/* Primary Viewport Card */}
              <div className="relative w-full h-[400px] sm:h-[500px] rounded-3xl bg-gray-50 dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 flex items-center justify-center p-8 overflow-hidden group shadow-xs">
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 shadow-2xs">
                    <Sparkles size={11} className="text-amber-500" />
                    <span>{product.category?.name || 'Curated Item'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                    <Check size={11} />
                    Verified Genuine
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleFav(product)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                  aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart
                    size={18}
                    className={`transition-colors ${
                      isFav
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                </button>

                {/* Main Product Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentDisplayImage}
                    alt={product.name}
                    width={450}
                    height={450}
                    unoptimized
                    priority
                    className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-24 rounded-2xl bg-gray-50 dark:bg-[#161922] border p-2 flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20'
                        : 'border-gray-200/80 dark:border-gray-800 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      width={80}
                      height={80}
                      unoptimized
                      className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* --------------------------------------------- */}
            {/* RIGHT: COMMERCE & SPECIFICATIONS PANEL        */}
            {/* --------------------------------------------- */}
            <div className="space-y-6">
              {/* Brand & Title */}
              <div className="space-y-2">
                {product.provider?.businessName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <Store size={13} className="text-emerald-500" />
                    <span>Merchant: {product.provider.businessName}</span>
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-950 dark:text-white leading-tight">
                  {product.name}
                </h1>

                {/* Rating & In-Stock */}
                <div className="flex items-center gap-3 text-xs pt-1">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-gray-900 dark:text-white font-extrabold ml-1">4.9</span>
                    <span className="text-gray-400 font-normal">(142 customer reviews)</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock & Ready to Ship
                  </span>
                </div>
              </div>

              {/* Price Block */}
              <div className="p-5 rounded-2xl bg-gray-50/80 dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white tracking-tight">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="text-base text-gray-400 line-through">
                  ${(Number(product.price) * 1.2).toFixed(2)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black">
                  Save 20%
                </span>
              </div>

              {/* Description Preview */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">Color Palette:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-9 h-9 rounded-full ${c.bg} border-2 transition-all cursor-pointer relative ${
                        selectedColor === c.name
                          ? 'ring-2 ring-black dark:ring-white scale-110 shadow-sm'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">Select Size:</span>
                  <button className="text-[11px] text-gray-500 hover:text-black dark:hover:text-white underline font-semibold">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-white dark:bg-[#161922] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Controller */}
                  <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 sm:w-36 shrink-0">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-gray-500 hover:text-black dark:hover:text-white p-0.5 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="text-gray-500 hover:text-black dark:hover:text-white p-0.5 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Bag CTA */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} className="stroke-[3]" />
                        <span>Added to Your Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        <span>Add to Bag • ${(Number(product.price) * quantity).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
                  <Truck size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-semibold">Free shipping over $50</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
                  <RefreshCw size={16} className="text-blue-500 shrink-0" />
                  <span className="text-[11px] font-semibold">30-day hassle-free returns</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
                  <ShieldCheck size={16} className="text-purple-500 shrink-0" />
                  <span className="text-[11px] font-semibold">Secure 256-bit checkout</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
                  <Award size={16} className="text-amber-500 shrink-0" />
                  <span className="text-[11px] font-semibold">100% genuine guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. DETAILS, SPECS & REVIEWS TABS                          */}
        {/* ========================================================= */}
        {product && (
          <section className="mt-16 pt-10 border-t border-gray-200/80 dark:border-gray-800">
            {/* Tabs Nav */}
            <div className="flex items-center justify-center gap-3 pb-8">
              {[
                { id: 'details', label: 'Product Details' },
                { id: 'specs', label: 'Specifications & Care' },
                { id: 'reviews', label: 'Customer Reviews (142)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-[#161922] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
              {activeTab === 'details' && (
                <div className="space-y-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    About this product
                  </h3>
                  <p>{product.description}</p>
                  <p>
                    Crafted with exceptional precision and attention to detail. Every seam and finishing touch is rigorously evaluated for longevity and timeless everyday style.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block">Category</span>
                      <span className="text-gray-500">{product.category?.name || 'Apparel & Lifestyle'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block">Fulfillment</span>
                      <span className="text-gray-500">Shipped direct by {product.provider?.businessName || 'Certified Partner'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Technical Specifications
                  </h3>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { label: 'Primary Materials', value: '100% Premium Eco-Certified Cotton & Polymer Blends' },
                      { label: 'Fit Profile', value: 'Tailored Regular Fit (True to standard size)' },
                      { label: 'Care Guidelines', value: 'Machine wash cold on gentle cycle, tumble dry low heat' },
                      { label: 'Origin', value: 'Responsibly manufactured under fair-wage standards' },
                    ].map((row, idx) => (
                      <div key={idx} className="py-3 flex justify-between gap-4">
                        <span className="font-bold text-gray-900 dark:text-white">{row.label}</span>
                        <span className="text-gray-500 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6 text-xs sm:text-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Shopper Feedback
                      </h3>
                      <p className="text-xs text-gray-400">Based on 142 verified customer reviews</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-gray-900 dark:text-white">4.9 / 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        author: 'Sarah Jenkins',
                        rating: 5,
                        date: 'September 18, 2026',
                        title: 'Exceeded all expectations!',
                        comment: 'The quality of the material is exceptional. Shipped very fast and fits true to size. Will definitely order from this seller again.',
                      },
                      {
                        author: 'David R.',
                        rating: 5,
                        date: 'September 10, 2026',
                        title: 'Modern and premium feel',
                        comment: 'Looks even better in person than in the catalog photos. Very comfortable and durable.',
                      },
                    ].map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 dark:text-white">{rev.author}</span>
                          <span className="text-[11px] text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400" />
                          ))}
                        </div>
                        <p className="font-bold text-xs text-gray-900 dark:text-white pt-1">{rev.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* 5. RELATED PRODUCTS SECTION                               */}
        {/* ========================================================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-200/80 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
                  You Might Also Like
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Discover more handpicked items from our marketplace catalog.
                </p>
              </div>

              <Link
                href="/products"
                className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ========================================================= */}
      {/* 6. STORE FOOTER                                           */}
      {/* ========================================================= */}
      <footer className="bg-white dark:bg-[#161922] py-12 border-t border-gray-200/80 dark:border-gray-800 transition-colors mt-20">
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
              Catalog
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

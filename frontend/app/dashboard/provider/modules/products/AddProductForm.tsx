'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Package,
  DollarSign,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  UploadCloud,
  X,
  Layers,
  Globe,
} from 'lucide-react';
import { createProduct, getCategories, CreateProductData } from '@/apis/products.api';

interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
}

const fallbackCategories: CategoryItem[] = [
  { id: 'cat-apparel', name: 'Apparel & Clothing' },
  { id: 'cat-footwear', name: 'Footwear & Shoes' },
  { id: 'cat-accessories', name: 'Accessories' },
  { id: 'cat-electronics', name: 'Audio & Electronics' },
  { id: 'cat-lifestyle', name: 'Lifestyle & Care' },
];

export default function AddProductForm() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [publishImmediately, setPublishImmediately] = useState<boolean>(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductData>({
    defaultValues: {
      name: '',
      description: '',
      price: undefined as unknown as number,
      image: null,
      categoryId: '',
    },
    mode: 'onTouched',
  });

  const watchedName = watch('name') || '';
  const watchedDescription = watch('description') || '';
  const watchedImage = watch('image');

  // Handle local image preview
  useEffect(() => {
    if (watchedImage && watchedImage[0] && watchedImage[0] instanceof File) {
      const url = URL.createObjectURL(watchedImage[0]);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [watchedImage]);

  // Load Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        setCategories(fallbackCategories);
      }
    }
    loadCategories();
  }, []);

  const handleClearImage = () => {
    setValue('image', null);
    setPreviewUrl(null);
  };

  const onSubmit = async (data: CreateProductData) => {
    setServerError(null);
    setServerSuccess(null);

    // Extra strict client-side validations
    const trimmedTitle = data.name.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 120) {
      setServerError('Product title must be between 3 and 120 characters.');
      return;
    }

    const trimmedDesc = data.description.trim();
    if (trimmedDesc.length < 10 || trimmedDesc.length > 2000) {
      setServerError('Product description must be between 10 and 2000 characters.');
      return;
    }

    const numericPrice = Number(data.price);
    if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 1000000) {
      setServerError('Price must be a valid positive number between $0.01 and $1,000,000.');
      return;
    }

    if (!data.categoryId) {
      setServerError('Please select a product category.');
      return;
    }

    if (!data.image?.[0]) {
      setServerError('Please select a product image file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', trimmedTitle);
      formData.append('description', trimmedDesc);
      formData.append('price', String(Number(numericPrice.toFixed(2))));
      formData.append('categoryId', data.categoryId);
      formData.append('isPublished', String(publishImmediately));
      formData.append('image', data.image[0]);

      await createProduct(formData);

      setServerSuccess(
        'Product registered successfully! It is now in your inventory pending admin review.',
      );

      reset({
        name: '',
        description: '',
        price: undefined as unknown as number,
        image: null,
        categoryId: '',
      });
      setPreviewUrl(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to publish product. Please check your inputs and try again.';
      setServerError(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/provider"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Package size={28} className="text-black dark:text-white" />
            <span>Add New Product</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and list a new item in your merchant catalog on SHOP.CO.
          </p>
        </div>

        <Link
          href="/dashboard/provider/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors shrink-0"
        >
          <span>View All Products</span>
        </Link>
      </div>

      {/* Success Notification Banner */}
      {serverSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">{serverSuccess}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Your product has been submitted and is ready for admin catalog approval.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/provider/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
            >
              <span>Manage in Inventory</span>
              <ExternalLink size={12} />
            </Link>
            <button
              type="button"
              onClick={() => setServerSuccess(null)}
              className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#161922] text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in transition-colors"
        >
          <AlertCircle size={18} className="shrink-0 text-red-500 dark:text-red-400" />
          <div className="flex-1 font-medium">{serverError}</div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Product Form Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6" noValidate>
        {/* Left Column: Core Product Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Information Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-5 transition-colors">
            <h2 className="text-base font-bold text-gray-950 dark:text-white pb-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>General Information</span>
            </h2>

            {/* Product Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="product-name" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-medium ${watchedName.length > 120 ? 'text-red-500 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                  {watchedName.length} / 120
                </span>
              </div>
              <input
                id="product-name"
                type="text"
                maxLength={120}
                placeholder="e.g. Classic Oversized Denim Jacket"
                {...register('name', {
                  required: 'Product title is required',
                  validate: {
                    notEmpty: (val) =>
                      (typeof val === 'string' && val.trim().length > 0) ||
                      'Product title cannot be empty or only spaces',
                    minLength: (val) =>
                      val.trim().length >= 3 || 'Title must be at least 3 characters',
                    maxLength: (val) =>
                      val.trim().length <= 120 || 'Title cannot exceed 120 characters',
                  },
                })}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all ${
                  errors.name
                    ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="product-description" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-medium ${watchedDescription.length > 2000 ? 'text-red-500 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                  {watchedDescription.length} / 2000
                </span>
              </div>
              <textarea
                id="product-description"
                rows={5}
                maxLength={2000}
                placeholder="Provide details about material, style, sizing, dimensions, and key features..."
                {...register('description', {
                  required: 'Product description is required',
                  validate: {
                    notEmpty: (val) =>
                      (typeof val === 'string' && val.trim().length > 0) ||
                      'Description cannot be empty or only spaces',
                    minLength: (val) =>
                      val.trim().length >= 10 || 'Description must be at least 10 characters',
                    maxLength: (val) =>
                      val.trim().length <= 2000 || 'Description cannot exceed 2000 characters',
                  },
                })}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all resize-none ${
                  errors.description
                    ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white'
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Pricing & Category Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-5 transition-colors">
            <h2 className="text-base font-bold text-gray-950 dark:text-white pb-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Pricing & Organization</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price Field */}
              <div>
                <label htmlFor="product-price" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Base Price ($ USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 font-bold text-sm">
                    $
                  </div>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1000000"
                    placeholder="89.99"
                    onKeyDown={(e) => {
                      // Block exponent, plus, minus symbols
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    {...register('price', {
                      required: 'Price is required',
                      validate: {
                        isPositiveNumber: (val) => {
                          const num = Number(val);
                          if (isNaN(num)) return 'Price must be a valid number';
                          if (num <= 0) return 'Price must be greater than $0.00';
                          if (num > 1000000) return 'Price cannot exceed $1,000,000';
                          if (!/^\d+(\.\d{1,2})?$/.test(String(val))) {
                            return 'Price can have at most 2 decimal places (e.g. 19.99)';
                          }
                          return true;
                        },
                      },
                    })}
                    className={`w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all ${
                      errors.price
                        ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">{errors.price.message}</p>
                )}
              </div>

              {/* Category Dropdown */}
              <div>
                <label htmlFor="product-category" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="product-category"
                    {...register('categoryId', {
                      required: 'Please select a category',
                      validate: (val) =>
                        (Boolean(val) && val.trim().length > 0) || 'Please select a valid category',
                    })}
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all cursor-pointer ${
                      errors.categoryId
                        ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white'
                    }`}
                  >
                    <option value="" className="bg-white dark:bg-[#161922] text-gray-500">
                      Select a category...
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#161922] text-gray-900 dark:text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.categoryId && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            {/* Publishing Status Toggle */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Globe size={18} className="text-blue-500 dark:text-blue-400" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Publish Immediately</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Make this product active on store shelves once approved by admin
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Media & Live Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Media URL & Live Preview Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-5 transition-colors">
            <h2 className="text-base font-bold text-gray-950 dark:text-white pb-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <ImageIcon size={16} className="text-blue-500" />
              <span>Product Media</span>
            </h2>

            {/* Image File Input */}
            <div>
              <label htmlFor="product-image" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Upload Image <span className="text-red-500">*</span>
              </label>
              
              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                {...register('image', {
                  required: 'Product image is required',
                  validate: {
                    hasFile: (files) => {
                      const file = files?.[0];
                      if (!file) return 'Product image is required';
                      return true;
                    },
                    fileType: (files) => {
                      const file = files?.[0];
                      if (!file) return true;
                      const validMimes = [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/gif',
                        'image/avif',
                      ];
                      return (
                        validMimes.includes(file.type) ||
                        file.type.startsWith('image/') ||
                        'Only JPG, PNG, WEBP, GIF, or AVIF image files are supported'
                      );
                    },
                    fileSize: (files) => {
                      const file = files?.[0];
                      if (!file) return true;
                      return (
                        file.size <= 5 * 1024 * 1024 ||
                        'Image file size must be 5MB or less'
                      );
                    },
                  },
                })}
                className={`w-full text-xs text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-200 dark:file:bg-gray-700 file:text-gray-800 dark:file:text-gray-100 hover:file:bg-gray-300 dark:hover:file:bg-gray-600 file:cursor-pointer cursor-pointer border rounded-xl p-2 bg-gray-50 dark:bg-gray-800/60 transition-all ${
                  errors.image
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                Supported formats: JPG, PNG, WEBP, AVIF (Max 5MB)
              </p>
              {errors.image && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">{errors.image.message}</p>
              )}
            </div>

            {/* Live Visual Preview Box */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Live Preview
                </span>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-[11px] font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="w-full h-52 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden relative group transition-colors">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain p-2.5 transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <UploadCloud size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Select an image to preview
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      Preview updates in real-time
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Submission Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3 transition-colors">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing product...</span>
                </>
              ) : (
                <>
                  <Package size={16} />
                  <span>Publish Product</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/provider/products')}
              className="w-full py-2.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

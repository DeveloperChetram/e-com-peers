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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductData>({
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      image: null,
      categoryId: '',
    },
    mode: 'onTouched',
  });

  const watchedImageUrl = watch('image');

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

 const onSubmit = async (data: CreateProductData) => {
  setServerError(null);
  setServerSuccess(null);

  try {
    const formData = new FormData();

    formData.append('name', data.name.trim());
    formData.append('description', data.description.trim());
    formData.append('price', String(Number(data.price)));
    formData.append('categoryId', data.categoryId);
    formData.append('isPublished', String(publishImmediately));

    if (data.image?.[0]) {
      formData.append('image', data.image[0]);
    }

    await createProduct(formData);

    setServerSuccess(
      'Product registered successfully! It is now in your inventory pending admin review.',
    );

    reset();
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to publish product. Please try again.';

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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 flex items-center gap-2">
            <Package size={28} className="text-black" />
            <span>Add New Product</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create and list a new item in your merchant catalog on SHOP.CO.
          </p>
        </div>

        <Link
          href="/dashboard/provider/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors shrink-0"
        >
          <span>View All Products</span>
        </Link>
      </div>

      {/* Success Notification Banner */}
      {serverSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-950">{serverSuccess}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your product is now active and ready for customers to buy.
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
              onClick={() => {
                setServerSuccess(null);
              }}
              className="px-3.5 py-1.5 rounded-full bg-white text-emerald-900 border border-emerald-200 text-xs font-bold hover:bg-emerald-50 transition-colors"
            >
              Add Another
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in"
        >
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <div className="flex-1 font-medium">{serverError}</div>
        </div>
      )}

      {/* Product Form Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6" noValidate>
        {/* Left Column: Core Product Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Information Card */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-950 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>General Information</span>
            </h2>

            {/* Product Title */}
            <div>
              <label htmlFor="product-name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="e.g. Classic Vintage Denim Jacket"
                {...register('name', {
                  required: 'Product title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                })}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.name
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label htmlFor="product-description" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Product Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="product-description"
                rows={4}
                placeholder="Provide details about material, style, sizing, and key highlights..."
                {...register('description', {
                  required: 'Product description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' },
                })}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all resize-none ${
                  errors.description
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Pricing & Category Card */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-950 pb-2 border-b border-gray-100 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600" />
              <span>Pricing & Organization</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price Field */}
              <div>
                <label htmlFor="product-price" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Base Price ($ USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">
                    $
                  </div>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    placeholder="89.99"
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 0.01, message: 'Price must be greater than $0' },
                    })}
                    className={`w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                      errors.price
                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>

              {/* Category Dropdown */}
              <div>
                <label htmlFor="product-category" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="product-category"
                    {...register('categoryId', {
                      required: 'Please select a category',
                    })}
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all cursor-pointer ${
                      errors.categoryId
                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                    }`}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.categoryId && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media & Live Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Media URL & Live Preview Card */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-950 pb-2 border-b border-gray-100 flex items-center gap-2">
              <ImageIcon size={16} className="text-blue-500" />
              <span>Product Media</span>
            </h2>

            {/* Image URL Input */}
            <div>
              <label htmlFor="product-image" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Image URL <span className="text-red-500">*</span>
              </label>
              {/* <input
                id="product-image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                {...register('imageUrl', {
                  required: 'Image URL is required',
                  pattern: {
                    value: /^(https?:\/\/).+/i,
                    message: 'Enter a valid URL (e.g. https://...)',
                  },
                })}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.imageUrl
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                }`}
              /> */}
                {


          <input
  id="product-image"
  type="file"
  accept="image/*"
  {...register('image', {
    required: 'Product image is required',

    validate: {
      fileType: (files) => {
        const file = files?.[0];

        if (!file) {
          return 'Product image is required';
        }

        return file.type.startsWith('image/')
          ? true
          : 'Only image files are allowed';
      },

      fileSize: (files) => {
        const file = files?.[0];

        if (!file) {
          return 'Product image is required';
        }

        return file.size <= 5 * 1024 * 1024
          ? true
          : 'Image must be less than 5MB';
      },
    },
  })}
/>
                }
              {errors.image && (
                <p className="text-[11px] text-red-500 mt-1">{errors.image.message}</p>
              )}
            </div>

            {/* Live Visual Preview Box */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-gray-400 mb-2">
                Live Image Preview
              </span>
              <div className="w-full h-48 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
          {watchedImageUrl?.[0] ? (
  <img
    src={URL.createObjectURL(watchedImageUrl[0])}
    alt="Preview"
    className="w-full h-full object-contain p-2"
  />
) : (
  <div className="flex flex-col items-center gap-2 text-gray-400">
    <ImageIcon size={32} />
    <span className="text-xs">
      Select an image to preview
    </span>
  </div>
)}
              </div>
            </div>
          </div>

          {/* Action Submission Card */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-2xs space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-gray-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
              onClick={() => router.push('/dashboard/provider')}
              className="w-full py-2.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

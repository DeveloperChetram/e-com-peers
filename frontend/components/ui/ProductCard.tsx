'use client';

import React, { useState } from 'react';
import { Heart, ShoppingBag, Check, Star, Store } from 'lucide-react';
import { resolveImages } from '@/apis/apiClient';
import Image from 'next/image';
import Link from 'next/link';

import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';

export interface Product {
  id?: string | number;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string;
  isPublished?: boolean;
  isApproved?: boolean;
  categoryId?: string;
  category?: {
    id?: string;
    name: string;
    slug?: string;
  };
  provider?: {
    id?: string;
    businessName: string;
  } | null;
}

interface ProductCardProps {
  product?: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

const defaultProduct: Product = {
  id: '1',
  name: 'Premium Wireless Headphones',
  description: 'Industry-leading noise canceling wireless headphones with crystal audio',
  price: 339,
  image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
};

const ProductCard: React.FC<ProductCardProps> = ({
  product = defaultProduct,
  onAddToCart,
  className = '',
}) => {
  const { addItem } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const [added, setAdded] = useState(false);

  const productId = String(product.id || '1');
  const isFav = isFavorite(productId);

  const rawImage =
    product.imageUrl ||
    product.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const displayImage = resolveImages(rawImage);

  const handleAdd = () => {
    const success = addItem({
      id: productId,
      name: product.name,
      price: Number(product.price || 0),
      imageUrl: rawImage,
      providerId: String(product.provider?.id || ''),
      categoryId: String(product.categoryId || product.category?.id || ''),
    });

    if (success) {
      onAddToCart?.(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const formattedPrice =
    typeof product.price === 'number'
      ? product.price.toFixed(2)
      : Number(product.price || 0).toFixed(2);

  return (
    <div
      className={`group relative bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden w-full ${className}`}
    >
      {/* Top Media & Heart Area */}
      <div className="relative p-5 pb-0">
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(product);
          }}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
          aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isFav
                ? 'text-red-500 fill-red-500'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'
            }`}
          />
        </button>

        {/* Category Pill Tag */}
        {product.category?.name && (
          <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 shadow-2xs">
            {product.category.name}
          </span>
        )}

        {/* Product Image Section */}
        <Link
          href={`/products/${product.id || '1'}`}
          className="relative block w-full h-56 sm:h-60 rounded-2xl bg-gray-50 dark:bg-gray-800/50 overflow-hidden cursor-pointer"
        >
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={product.name}
                width={220}
                height={220}
                unoptimized
                className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-108 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                <ShoppingBag size={24} />
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-5 pt-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Provider name / Brand */}
          {product.provider?.businessName && (
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate">
              <Store size={12} className="text-emerald-500" />
              <span>{product.provider.businessName}</span>
            </p>
          )}

          {/* Title */}
          <Link href={`/products/${product.id || '1'}`} className="block">
            <h2
              className="text-sm sm:text-base font-bold text-gray-950 dark:text-white tracking-tight line-clamp-1 hover:underline transition-all"
              title={product.name}
            >
              {product.name}
            </h2>
          </Link>

          {/* Description */}
          <p
            className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2"
            title={product.description}
          >
            {product.description}
          </p>
        </div>

        {/* Rating & Stock Indicator */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-gray-900 dark:text-gray-200">4.8</span>
            <span className="text-gray-400 dark:text-gray-500 font-normal">(42)</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            In Stock
          </span>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold leading-none">
              Price
            </span>
            <span className="text-lg sm:text-xl font-black text-gray-950 dark:text-white tracking-tight">
              ${formattedPrice}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
            }`}
          >
            {added ? (
              <>
                <Check size={14} className="stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
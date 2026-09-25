'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Package,
  Store,
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { resolveImages } from '@/apis/apiClient';

export default function UserWishlistPage() {
  const { favorites, remove } = useFavorites();
  const { addItem } = useCart();

  const handleMoveToBag = (product: any) => {
    if (!product) return;
    addItem({
      id: String(product.id || product.productId),
      name: product.name,
      price: Number(product.price || 0),
      imageUrl: product.imageUrl || '',
      providerId: String(product.providerId || product.provider?.id || ''),
      categoryId: String(product.categoryId || product.category?.id || ''),
    });
    // Remove from wishlist after moving to bag
    remove(String(product.id || product.productId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            <Heart size={28} className="text-rose-500 fill-rose-500" />
            <span>Saved Wishlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Keep track of items you love and move them directly to your bag when you are ready.
          </p>
        </div>

        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
        </span>
      </div>

      {/* Grid */}
      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] p-16 rounded-3xl border border-gray-200/80 dark:border-gray-800 text-center">
          <Heart size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-4">
            Explore our latest collections and save items you want to shop later.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <ShoppingBag size={14} />
            <span>Browse Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((item) => {
            const product = item.product || {
              id: item.productId,
              name: 'Saved Product',
              price: 0,
              imageUrl: '',
            };
            const pid = String(item.productId || product.id);
            const img = product.imageUrl ? resolveImages(product.imageUrl) : '';

            return (
              <div
                key={pid}
                className="bg-white dark:bg-[#161922] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden flex flex-col justify-between transition-colors group"
              >
                <div className="p-4 space-y-3">
                  <div className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 relative overflow-hidden p-3">
                    {img ? (
                      <Image
                        src={img}
                        alt={product.name}
                        width={140}
                        height={140}
                        unoptimized
                        className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package size={36} className="opacity-40" />
                    )}

                    <button
                      onClick={() => remove(pid)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    {product.category?.name && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {product.category.name}
                      </span>
                    )}
                    <Link href={`/products/${pid}`} className="block">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mt-0.5 hover:underline">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">
                      ${Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

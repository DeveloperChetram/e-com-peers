'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setFavorites,
  toggleFavoriteOptimistic,
  removeFavorite,
  selectFavorites,
  selectIsFavorite,
  FavoriteItem,
} from '@/redux/slices/user.slice';
import { getFavorites, toggleFavoriteApi } from '@/apis/favorites.api';

export function useFavorites() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectFavorites);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Check if a product is saved as favorite
  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favorites.some((f) => String(f.productId) === String(productId));
    },
    [favorites]
  );

  // Hydrate favorites from DB on load/login
  const hydrateFavorites = useCallback(async () => {
    try {
      const res = await getFavorites();
      if (Array.isArray(res)) {
        const formatted: FavoriteItem[] = res.map((f: any) => ({
          id: f.id,
          productId: String(f.productId),
          product: f.product,
        }));
        dispatch(setFavorites(formatted));
      }
    } catch {
      // Unauthenticated or network error
    }
  }, [dispatch]);

  // Toggle favorite (Requires login. Optimistic Redux toggle + background API call)
  const toggle = useCallback(
    (product: any): boolean => {
      if (!isAuthenticated) {
        alert('Please log in first to save items to your favorites.');
        router.push('/login');
        return false;
      }

      const productId = String(product?.id || product?.productId);
      if (!productId) return false;

      // 1. Optimistic update in user slice
      dispatch(toggleFavoriteOptimistic({ productId, product }));

      // 2. Background DB toggle
      toggleFavoriteApi(productId).catch(() => {});

      return true;
    },
    [dispatch, isAuthenticated, router]
  );

  // Remove single favorite
  const remove = useCallback(
    (productId: string) => {
      const pid = String(productId);
      dispatch(removeFavorite(pid));
      toggleFavoriteApi(pid).catch(() => {});
    },
    [dispatch]
  );

  return {
    favorites,
    isFavorite,
    toggle,
    remove,
    hydrateFavorites,
  };
}

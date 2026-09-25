'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setUserAndToken } from '@/redux/slices/auth.slice';
import { setCart, CartItem } from '@/redux/slices/cart.slice';
import { getUserProfile } from '@/apis/auth.api';
import { getCart } from '@/apis/cart.api';
import { getFavorites } from '@/apis/favorites.api';
import { setFavorites, FavoriteItem } from '@/redux/slices/user.slice';

export function AppInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuthAndCart = async () => {
      try {
        // 1. Restore authenticated user profile via cookie
        const user = await getUserProfile();
        if (user?.id) {
          dispatch(
            setUserAndToken({
              user,
              role: user.role,
              token: null,
            })
          );

          // 2. Hydrate cart from database
          try {
            const cartRes = await getCart();
            if (cartRes?.items && Array.isArray(cartRes.items)) {
              const formattedItems: CartItem[] = cartRes.items.map((item: any) => ({
                product: {
                  id: String(item.product?.id || item.productId),
                  name: item.product?.name || 'Product',
                  price: Number(item.product?.price || 0),
                  imageUrl: item.product?.imageUrl || '',
                  providerId: String(item.product?.providerId || ''),
                  categoryId: String(item.product?.categoryId || ''),
                  slug: item.product?.slug || null,
                },
                quantity: item.quantity,
              }));
              dispatch(setCart(formattedItems));
            }
          } catch {
            // Silently handle cart fetch error
          }

          // 3. Hydrate favorites from database into user slice
          try {
            const favRes = await getFavorites();
            if (Array.isArray(favRes)) {
              const formattedFavs: FavoriteItem[] = favRes.map((f: any) => ({
                id: f.id,
                productId: String(f.productId),
                product: f.product,
              }));
              dispatch(setFavorites(formattedFavs));
            }
          } catch {
            // Silently handle favorites fetch error
          }
        }
      } catch {
        // User is not authenticated — keep guest state
      }
    };

    initializeAuthAndCart();
  }, [dispatch]);

  return null;
}

'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setUserAndToken, setInitialized, logout } from '@/redux/slices/auth.slice';
import { setCart, CartItem } from '@/redux/slices/cart.slice';
import { getUserProfile, logoutUser } from '@/apis/auth.api';
import { getCart } from '@/apis/cart.api';
import { getFavorites } from '@/apis/favorites.api';
import { setFavorites, FavoriteItem } from '@/redux/slices/user.slice';
import {
  getUserFromStorage,
  getRoleFromStorage,
  saveUserToStorage,
  clearUserFromStorage,
} from '@/utils/userStorage';

export function AppInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 1. Immediately hydrate from localStorage on application load so appropriate dashboard and UI can show without waiting
    const cachedUser = getUserFromStorage();
    const cachedRole = getRoleFromStorage();
    if (cachedUser?.id) {
      dispatch(
        setUserAndToken({
          user: cachedUser,
          role: cachedRole || cachedUser.role,
          token: null,
        })
      );
    }

    const initializeAuthAndCart = async () => {
      try {
        // 2. Fetch fresh user profile via cookie and refresh localStorage
        const user = await getUserProfile();
        if (user?.id) {
          saveUserToStorage(user, user.role);
          dispatch(
            setUserAndToken({
              user,
              role: user.role,
              token: null,
            })
          );

          // 3. Hydrate cart from database
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

          // 4. Hydrate favorites from database into user slice
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
        } else {
          clearUserFromStorage();
          dispatch(logout());
        }
      } catch {
        // Clear invalid auth cookie and local storage if profile fetch fails
        clearUserFromStorage();
        await logoutUser().catch(() => {});
        dispatch(logout());
      } finally {
        dispatch(setInitialized(true));
      }
    };

    initializeAuthAndCart();
  }, [dispatch]);

  return null;
}

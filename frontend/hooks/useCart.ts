'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  CartProduct,
  CartItem,
} from '@/redux/slices/cart.slice';
import { getCart, updateCartItemApi, syncCart } from '@/apis/cart.api';

export function useCart() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Hydrate cart from backend DB on load / login
  const hydrateCart = useCallback(async () => {
    try {
      const res = await getCart();
      if (res?.items && Array.isArray(res.items)) {
        const formattedItems: CartItem[] = res.items.map((item: any) => ({
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
      // Unauthenticated or network error
    }
  }, [dispatch]);

  // 1. Add to cart (Checks if logged in first. If not, prompts and redirects to /login)
  const addItem = useCallback(
    (product: CartProduct, qty = 1): boolean => {
      if (!isAuthenticated) {
        alert('Please log in first to add items to your cart.');
        router.push('/login');
        return false;
      }

      dispatch(addToCart({ product, quantity: qty }));

      const existing = items.find((i) => String(i.product.id) === String(product.id));
      const targetQuantity = (existing?.quantity || 0) + qty;

      // Background DB sync
      updateCartItemApi({
        productId: String(product.id),
        quantity: targetQuantity,
      }).catch(() => {});

      return true;
    },
    [dispatch, items, isAuthenticated, router]
  );

  // 2. Update item quantity
  const setQuantity = useCallback(
    (productId: string, qty: number) => {
      dispatch(updateQuantity({ productId: String(productId), quantity: qty }));

      // Background DB sync
      updateCartItemApi({
        productId: String(productId),
        quantity: Math.max(0, qty),
      }).catch(() => {});
    },
    [dispatch]
  );

  // 3. Remove single item
  const removeItem = useCallback(
    (productId: string) => {
      dispatch(removeFromCart({ productId: String(productId) }));

      // Background DB sync
      updateCartItemApi({
        productId: String(productId),
        quantity: 0,
      }).catch(() => {});
    },
    [dispatch]
  );

  // 4. Clear full cart
  const clearAll = useCallback(() => {
    dispatch(clearCart());

    // Background DB sync
    syncCart([]).catch(() => {});
  }, [dispatch]);

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    setQuantity,
    removeItem,
    clearAll,
    hydrateCart,
  };
}

import { apiClient } from './apiClient';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItemData {
  productId: string;
  quantity: number;
}

export interface CartResponse {
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string;
      providerId: string;
      categoryId: string;
      slug?: string | null;
    };
  }[];
  totalItems: number;
  totalPrice: number;
}

// ─── Cart API Functions ──────────────────────────────────────────────────────

// 1. Get cart from DB (used on app load / login to hydrate Redux state)
export const getCart = async (): Promise<CartResponse> =>
  apiClient('/user/cart');

// 2. Sync full cart to push/persist in DB (e.g. guest-to-user login or full sync)
export const syncCart = async (items: CartItemData[]): Promise<CartResponse> =>
  apiClient('/user/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });

// 3. Patch single item in DB (handles add, increment, decrement, or remove if quantity <= 0)
export const updateCartItemApi = async (data: CartItemData): Promise<void> =>
  apiClient('/user/cart/item', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

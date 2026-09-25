import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Shape of a single product being added to the cart
// Mirrors what the backend Product model returns
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  providerId?: string;   // needed when placing an order (per-provider split)
  categoryId?: string;
  slug?: string | null;
}

// Shape of one item inside the cart
export interface CartItem {
  product: CartProduct;
  quantity: number;
}

// Shape of the full cart state
interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add a product to cart. If it already exists, increase its quantity.
    addToCart: (
      state,
      action: PayloadAction<{ product: CartProduct; quantity: number }>
    ) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },

    // Remove a product entirely from the cart by its id
    removeFromCart: (state, action: PayloadAction<{ productId: string }>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload.productId
      );
    },

    // Set a product's quantity to a specific value.
    // If the new quantity is <= 0, the item is removed.
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.product.id !== productId);
      } else {
        const existing = state.items.find((item) => item.product.id === productId);
        if (existing) {
          existing.quantity = quantity;
        }
      }
    },

    // Replace full cart items array (called on initial load / login from backend getCart)
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload || [];
    },

    // Remove all items from the cart (called after a successful order placement)
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } = cartSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

// Total number of individual units in the cart (shown as badge on cart icon)
export const selectTotalItems = (state: { cart: CartState }): number =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

// Total price of all items in the cart
export const selectTotalPrice = (state: { cart: CartState }): number =>
  state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

// All cart items
export const selectCartItems = (state: { cart: CartState }): CartItem[] =>
  state.cart.items;

// Check if a specific product is already in the cart
export const selectIsInCart =
  (productId: string) =>
  (state: { cart: CartState }): boolean =>
    state.cart.items.some((item) => item.product.id === productId);

// Get quantity of a specific product in the cart (0 if not present)
export const selectProductQuantity =
  (productId: string) =>
  (state: { cart: CartState }): number => {
    const item = state.cart.items.find((i) => i.product.id === productId);
    return item?.quantity ?? 0;
  };

export default cartSlice.reducer;

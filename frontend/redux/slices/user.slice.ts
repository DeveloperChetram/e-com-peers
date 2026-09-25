import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteItem {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
    category?: { id?: string; name: string };
    provider?: { id?: string; businessName: string };
    inStock?: boolean;
  };
}

export interface AddressItem {
  id: string;
  userId: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface UserState {
  favorites: FavoriteItem[];
  addresses: AddressItem[];
  selectedAddressId: string | null;
}

const initialState: UserState = {
  favorites: [],
  addresses: [],
  selectedAddressId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // ─── Favorites Reducers ─────────────────────────────────────────

    // Set all favorites from backend
    setFavorites: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.favorites = action.payload || [];
    },

    // Optimistic toggle of a favorite item
    toggleFavoriteOptimistic: (
      state,
      action: PayloadAction<{ productId: string; product?: any }>
    ) => {
      const { productId, product } = action.payload;
      const index = state.favorites.findIndex(
        (f) => String(f.productId) === String(productId)
      );

      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push({
          productId: String(productId),
          product: product || {
            id: String(productId),
            name: product?.name || 'Product',
            price: Number(product?.price || 0),
            imageUrl: product?.imageUrl || '',
          },
        });
      }
    },

    // Remove single favorite
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(
        (f) => String(f.productId) !== String(action.payload)
      );
    },

    // ─── Address Reducers ───────────────────────────────────────────

    // Set all addresses from backend
    setAddresses: (state, action: PayloadAction<AddressItem[]>) => {
      state.addresses = action.payload || [];
      if (!state.selectedAddressId && state.addresses.length > 0) {
        state.selectedAddressId = state.addresses[0].id;
      }
    },

    // Add new address
    addAddressState: (state, action: PayloadAction<AddressItem>) => {
      state.addresses.unshift(action.payload);
      if (!state.selectedAddressId) {
        state.selectedAddressId = action.payload.id;
      }
    },

    // Update existing address
    updateAddressState: (state, action: PayloadAction<AddressItem>) => {
      const index = state.addresses.findIndex((a) => a.id === action.payload.id);
      if (index >= 0) {
        state.addresses[index] = action.payload;
      }
    },

    // Remove address
    removeAddressState: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      if (state.selectedAddressId === action.payload) {
        state.selectedAddressId = state.addresses[0]?.id || null;
      }
    },

    // Set selected address ID for checkout
    setSelectedAddressId: (state, action: PayloadAction<string | null>) => {
      state.selectedAddressId = action.payload;
    },

    // Clear user state on logout
    clearUserState: (state) => {
      state.favorites = [];
      state.addresses = [];
      state.selectedAddressId = null;
    },
  },
});

export const {
  setFavorites,
  toggleFavoriteOptimistic,
  removeFavorite,
  setAddresses,
  addAddressState,
  updateAddressState,
  removeAddressState,
  setSelectedAddressId,
  clearUserState,
} = userSlice.actions;

// ─── Selectors ──────────────────────────────────────────────────────

export const selectFavorites = (state: { user: UserState }) =>
  state.user?.favorites || [];

export const selectIsFavorite =
  (productId: string) =>
  (state: { user: UserState }): boolean =>
    state.user?.favorites?.some((f) => String(f.productId) === String(productId)) ||
    false;

export const selectAddresses = (state: { user: UserState }) =>
  state.user?.addresses || [];

export const selectSelectedAddressId = (state: { user: UserState }) =>
  state.user?.selectedAddressId;

export const selectSelectedAddress = (state: { user: UserState }) => {
  const addresses = state.user?.addresses || [];
  const selectedId = state.user?.selectedAddressId;
  return addresses.find((a) => a.id === selectedId) || addresses[0] || null;
};

export default userSlice.reducer;

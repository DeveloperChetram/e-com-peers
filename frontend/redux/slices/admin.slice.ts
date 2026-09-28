import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AdminStats,
  AdminUser,
  AdminProvider,
  AdminProduct,
  AdminCategory,
} from '@/apis/admin.api';

interface AdminState {
  stats: AdminStats | null;
  users: AdminUser[];
  providers: AdminProvider[];
  products: AdminProduct[];
  categories: AdminCategory[];
  loading: boolean;
}

const initialState: AdminState = {
  stats: null,
  users: [],
  providers: [],
  products: [],
  categories: [],
  loading: false,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStats: (state, action: PayloadAction<AdminStats | null>) => {
      state.stats = action.payload;
    },
    setUsers: (state, action: PayloadAction<AdminUser[]>) => {
      state.users = action.payload;
    },
    updateUserInState: (state, action: PayloadAction<Partial<AdminUser> & { id: number }>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    removeUserFromState: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      if (state.stats) {
        state.stats.users = Math.max(0, state.stats.users - 1);
      }
    },
    setProviders: (state, action: PayloadAction<AdminProvider[]>) => {
      state.providers = action.payload;
    },
    updateProviderInState: (state, action: PayloadAction<Partial<AdminProvider> & { id: string }>) => {
      const index = state.providers.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.providers[index] = { ...state.providers[index], ...action.payload };
      }
    },
    removeProviderFromState: (state, action: PayloadAction<string>) => {
      state.providers = state.providers.filter((p) => p.id !== action.payload);
      if (state.stats) {
        state.stats.providers = Math.max(0, state.stats.providers - 1);
      }
    },
    setProducts: (state, action: PayloadAction<AdminProduct[]>) => {
      state.products = action.payload;
    },
    updateProductInState: (state, action: PayloadAction<Partial<AdminProduct> & { id: string }>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...action.payload };
      }
    },
    removeProductFromState: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
      if (state.stats) {
        state.stats.products = Math.max(0, state.stats.products - 1);
      }
    },
    setCategories: (state, action: PayloadAction<AdminCategory[]>) => {
      state.categories = action.payload;
    },
    addCategoryToState: (state, action: PayloadAction<AdminCategory>) => {
      state.categories.unshift(action.payload);
    },
    updateCategoryInState: (state, action: PayloadAction<Partial<AdminCategory> & { id: string }>) => {
      const index = state.categories.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = { ...state.categories[index], ...action.payload };
      }
    },
    removeCategoryFromState: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setStats,
  setUsers,
  updateUserInState,
  removeUserFromState,
  setProviders,
  updateProviderInState,
  removeProviderFromState,
  setProducts,
  updateProductInState,
  removeProductFromState,
  setCategories,
  addCategoryToState,
  updateCategoryInState,
  removeCategoryFromState,
} = adminSlice.actions;

export default adminSlice.reducer;

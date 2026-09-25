import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductItem, CategoryItem } from '@/apis/products.api';

interface ProviderState {
  products: ProductItem[];
  categories: CategoryItem[];
  loading: boolean;
}

const initialState: ProviderState = {
  products: [],
  categories: [],
  loading: false,
};

export const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<ProductItem[]>) => {
      state.products = action.payload;
    },
    setCategories: (state, action: PayloadAction<CategoryItem[]>) => {
      state.categories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateProductInState: (state, action: PayloadAction<ProductItem>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProductFromState: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    addProductToState: (state, action: PayloadAction<ProductItem>) => {
      state.products.unshift(action.payload);
    },
  },
});

export const {
  setProducts,
  setCategories,
  setLoading,
  updateProductInState,
  removeProductFromState,
  addProductToState,
} = providerSlice.actions;

export default providerSlice.reducer;

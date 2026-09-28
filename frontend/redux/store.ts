import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import providerReducer from './slices/provider.slice';
import adminReducer from './slices/admin.slice';
import cartReducer from './slices/cart.slice';
import userReducer from './slices/user.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    provider: providerReducer,
    admin: adminReducer,
    cart: cartReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveUserToStorage, clearUserFromStorage } from '@/utils/userStorage';

interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  role: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  role: null,
  isInitialized: false,
};

export const counterSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAndToken: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string | null; role?: string }>
    ) => {
      const resolvedRole = action.payload.role || action.payload.user?.role || null;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.role = resolvedRole;
      state.isInitialized = true;
      saveUserToStorage(action.payload.user, resolvedRole);
    },
    setUser: (
      state,
      action: PayloadAction<{ user: AuthUser; role?: string }>
    ) => {
      const resolvedRole = action.payload.role || action.payload.user?.role || null;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.role = resolvedRole;
      state.isInitialized = true;
      saveUserToStorage(action.payload.user, resolvedRole);
    },
    setToken: (
      state,
      action: PayloadAction<{ token: string; role?: string }>
    ) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.role = action.payload.role || null;
      state.isInitialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.isInitialized = true;
      clearUserFromStorage();
    },
  },
});

export const { setUserAndToken, setUser, setToken, setInitialized, logout } = counterSlice.actions;

export default counterSlice.reducer;
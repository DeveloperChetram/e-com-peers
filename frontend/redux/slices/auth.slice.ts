import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: null,
    user: null,
    role: null,
  },
  reducers: {
  setUserAndToken: (state, action) => {
    state.user = action.payload.user;
    state.token = action.payload.token;
    state.isAuthenticated = true;
    state.role = action.payload.role;
  },
    setUser: (state, action) => {
    state.user = action.payload.user;
    state.isAuthenticated = true;
    state.role = action.payload.role;
  },
    setToken: (state, action) => {
    state.token = action.payload.token;
    state.isAuthenticated = true;
    state.role = action.payload.role;
  },
    logout: (state) => {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
    state.role = null;
  },
    },
  }
)

// Action creators are generated for each case reducer function
export const { setUserAndToken, setUser, setToken, logout } = counterSlice.actions;

export default counterSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { removeToken } from '@/lib/api';

export interface Order {
  book: string; // Book ID
  date: string; // ISO date string
}

export interface Review {
  user: string; // User ID
  rating: number;
  comment?: string;
  date: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'author' | 'admin';
  subscription?: 'none' | 'basic' | 'premium' | 'enterprise';
  cart?: string[]; // Array of Book IDs
  orders?: Order[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      removeToken(); // Remove token from localStorage
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;

export default authSlice.reducer;
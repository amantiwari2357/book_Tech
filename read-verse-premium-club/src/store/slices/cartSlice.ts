import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Book } from './booksSlice';
import { authFetch } from '@/lib/api';

interface CartState {
  items: Book[];
  isOpen: boolean;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const res = await authFetch('/cart');
  const data = await res.json();
  // Map backend _id to id
  return data.map((book: any) => ({ ...book, id: book._id }));
});

export const addToCartAsync = createAsyncThunk('cart/addToCart', async (bookId: string) => {
  const res = await authFetch(`/cart/${bookId}`, { method: 'POST' });
  const data = await res.json();
  return data.map((book: any) => ({ ...book, id: book._id }));
});

export const removeFromCartAsync = createAsyncThunk('cart/removeFromCart', async (bookId: string) => {
  const res = await authFetch(`/cart/${bookId}`, { method: 'DELETE' });
  const data = await res.json();
  return data.map((book: any) => ({ ...book, id: book._id }));
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.total = action.payload.reduce((total, book) => total + (book.price || 0), 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = action.payload.reduce((total, book) => total + (book.price || 0), 0);
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = action.payload.reduce((total, book) => total + (book.price || 0), 0);
      });
  },
});

export const { toggleCart, setCartOpen, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
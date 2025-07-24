import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '@/lib/api';

export interface Review {
  user: string; // User ID
  rating: number;
  comment?: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  category: string;
  genre?: string;
  tags: string[];
  isPremium: boolean;
  rating: number;
  totalReviews: number;
  fileUrl?: string;
  previewUrl?: string;
  authorRef?: string; // User ID
  reviews?: Review[];
  status?: 'pending' | 'approved' | 'rejected';
  sales?: number;
  earnings?: number;
}

export const fetchBooks = createAsyncThunk('books/fetchBooks', async () => {
  const res = await authFetch('/books');
  const data = await res.json();
  // Map backend _id to id
  return data.map((book: any) => ({ ...book, id: book._id }));
});

interface BooksState {
  books: Book[];
  featuredBooks: Book[];
  searchTerm: string;
  selectedCategory: string;
  loading: boolean;
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  featuredBooks: [],
  searchTerm: '',
  selectedCategory: 'All',
  loading: false,
  error: null,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks: (state, action: PayloadAction<Book[]>) => {
      state.books = action.payload;
    },
    setFeaturedBooks: (state, action: PayloadAction<Book[]>) => {
      state.featuredBooks = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addBook: (state, action: PayloadAction<Book>) => {
      state.books.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch books';
      });
  },
});

export const {
  setBooks,
  setFeaturedBooks,
  setSearchTerm,
  setSelectedCategory,
  setLoading,
  setError,
  addBook,
} = booksSlice.actions;

export default booksSlice.reducer;
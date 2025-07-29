import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import booksReducer from './slices/booksSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import subscriptionReducer from './slices/subscriptionSlice';

// Configure persistence for books slice
const booksPersistConfig = {
  key: 'books',
  storage,
  whitelist: ['books', 'featuredBooks'], // Only persist books and featuredBooks
};

const persistedBooksReducer = persistReducer(booksPersistConfig, booksReducer);

export const store = configureStore({
  reducer: {
    books: persistedBooksReducer,
    cart: cartReducer,
    auth: authReducer,
    subscription: subscriptionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
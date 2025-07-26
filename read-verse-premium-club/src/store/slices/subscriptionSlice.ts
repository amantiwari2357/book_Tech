import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '@/lib/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

interface SubscriptionState {
  currentPlan: SubscriptionPlan | null;
  isSubscribed: boolean;
  subscriptionEnd: Date | null;
  availablePlans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
}

// Thunk to fetch plans from backend
export const fetchPlans = createAsyncThunk('subscription/fetchPlans', async () => {
  const res = await authFetch('/checkout/plans');
  if (!res.ok) throw new Error('Failed to fetch plans');
  return await res.json();
});

const initialState: SubscriptionState = {
  currentPlan: null,
  isSubscribed: false,
  subscriptionEnd: null,
  availablePlans: [],
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setCurrentPlan: (state, action: PayloadAction<SubscriptionPlan | null>) => {
      state.currentPlan = action.payload;
      state.isSubscribed = !!action.payload;
    },
    setSubscriptionEnd: (state, action: PayloadAction<Date | null>) => {
      state.subscriptionEnd = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<SubscriptionPlan[]>) => {
        state.loading = false;
        state.availablePlans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch plans';
      });
  },
});

export const { setCurrentPlan, setSubscriptionEnd, setLoading, setError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
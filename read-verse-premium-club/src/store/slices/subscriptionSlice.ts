import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const initialState: SubscriptionState = {
  currentPlan: null,
  isSubscribed: false,
  subscriptionEnd: null,
  availablePlans: [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      features: ['Access to 1000+ books', 'Standard support', 'Basic reading features'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: ['Access to all books', 'Priority support', 'Advanced reading features', 'Offline reading'],
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 39.99,
      features: ['Everything in Premium', 'Team collaboration', 'Admin dashboard', 'Custom integrations'],
    },
  ],
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
});

export const { setCurrentPlan, setSubscriptionEnd, setLoading, setError } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
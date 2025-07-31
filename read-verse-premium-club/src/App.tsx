import React, { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { store, persistor } from "@/store";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { checkAuthStatus } from "@/lib/api";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import CartSidebar from "@/components/Cart/CartSidebar";
import LoadingSpinner from '@/components/ui/loading-spinner';

// Lazy load components for better performance
const Home = React.lazy(() => import('@/pages/Home'));
const Login = React.lazy(() => import('@/pages/Auth/Login'));
const SignUp = React.lazy(() => import('@/pages/Auth/SignUp'));
const Browse = React.lazy(() => import('@/pages/Browse'));
const BookDetails = React.lazy(() => import('@/pages/BookDetails'));
const Reader = React.lazy(() => import('@/pages/Reader'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Orders = React.lazy(() => import('@/pages/Orders'));
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));
const CustomerDashboard = React.lazy(() => import('@/pages/CustomerDashboard'));
const AuthorDashboard = React.lazy(() => import('@/pages/AuthorDashboard'));
const TestLogin = React.lazy(() => import('@/pages/TestLogin'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Auth Initializer Component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const user = await checkAuthStatus();
        if (user) {
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<PageLoader />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <HelmetProvider>
              <TooltipProvider>
                <Router>
                  <AuthInitializer>
                    <div className="min-h-screen flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/browse" element={<Browse />} />
                            <Route path="/book/:id" element={<BookDetails />} />
                            <Route path="/reader/:id" element={<Reader />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                            <Route path="/author-dashboard" element={<AuthorDashboard />} />
                            <Route path="/test-login" element={<TestLogin />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <Footer />
                      <CartSidebar />
                    </div>
                    <Toaster />
                    <Sonner />
                  </AuthInitializer>
                </Router>
              </TooltipProvider>
            </HelmetProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

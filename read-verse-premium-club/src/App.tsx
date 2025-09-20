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
const AdminUserManagement = React.lazy(() => import('@/pages/AdminUserManagement'));
const AdminAuthorManagement = React.lazy(() => import('@/pages/AdminAuthorManagement'));
const AdminFinancialManagement = React.lazy(() => import('@/pages/AdminFinancialManagement'));
const AdminBookManagement = React.lazy(() => import('@/pages/AdminBookManagement'));
const AdminBookApprovals = React.lazy(() => import('@/pages/AdminBookApprovals'));
const CustomerDashboard = React.lazy(() => import('@/pages/CustomerDashboard'));
const AuthorDashboard = React.lazy(() => import('@/pages/AuthorDashboard'));
const AuthorEnhancedDashboard = React.lazy(() => import('@/pages/AuthorEnhancedDashboard'));
const AuthorBookCreation = React.lazy(() => import('@/pages/AuthorBookCreation'));
const AuthorOrderManagement = React.lazy(() => import('@/pages/AuthorOrderManagement'));
const EBookReader = React.lazy(() => import('@/pages/EBookReader'));
const DeliveryBoyDashboard = React.lazy(() => import('@/pages/DeliveryBoyDashboard'));
const AuthorAnalytics = React.lazy(() => import('@/pages/AuthorAnalytics'));
const TestLogin = React.lazy(() => import('@/pages/TestLogin'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Customer Dashboard Pages
const Wishlist = React.lazy(() => import('@/pages/Wishlist'));
const MyLibrary = React.lazy(() => import('@/pages/MyLibrary'));
const Wallet = React.lazy(() => import('@/pages/Wallet'));
const Reviews = React.lazy(() => import('@/pages/Reviews'));
const CustomerSupport = React.lazy(() => import('@/pages/CustomerSupport'));
const Security = React.lazy(() => import('@/pages/Security'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));

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
                            <Route path="/admin/users" element={<AdminUserManagement />} />
                            <Route path="/admin/authors" element={<AdminAuthorManagement />} />
                            <Route path="/admin/financials" element={<AdminFinancialManagement />} />
                            <Route path="/admin/books" element={<AdminBookManagement />} />
                            <Route path="/admin/book-approvals" element={<AdminBookApprovals />} />
                            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                            <Route path="/author-dashboard" element={<AuthorEnhancedDashboard />} />
                            <Route path="/author/create-book" element={<AuthorBookCreation />} />
                            <Route path="/author/orders" element={<AuthorOrderManagement />} />
                            <Route path="/ebook-reader/:id" element={<EBookReader />} />
                            <Route path="/delivery-boy-dashboard" element={<DeliveryBoyDashboard />} />
                            <Route path="/author-analytics" element={<AuthorAnalytics />} />
                            <Route path="/test-login" element={<TestLogin />} />
                            
                            {/* Customer Dashboard Pages */}
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/my-library" element={<MyLibrary />} />
                            <Route path="/wallet" element={<Wallet />} />
                            <Route path="/reviews" element={<Reviews />} />
                            <Route path="/customer-support" element={<CustomerSupport />} />
                            <Route path="/security" element={<Security />} />
                            <Route path="/analytics" element={<Analytics />} />
                            
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

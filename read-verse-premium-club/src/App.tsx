import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { store } from "@/store";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import CartSidebar from "@/components/Cart/CartSidebar";
import { useToast } from '@/hooks/use-toast';
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
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const queryClient = new QueryClient();

// Auth initialization component
const AuthInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await authFetch('/auth/me');
          if (res.ok) {
            const user = await res.json();
            dispatch(setUser(user));
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return null;
};

// Main app content component
const AppContent = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthInitializer />
      <AuthRedirect />
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/reader/:id" element={<Reader />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-book-approvals" element={<AdminBookApprovals />} />
            <Route path="/admin-book-management" element={<AdminBookManagement />} />
            <Route path="/admin-plan-management" element={<AdminPlanManagement />} />
            <Route path="/book-design" element={<BookDesign />} />
            <Route path="/book-design-reader/:id" element={<BookDesignReader />} />
            <Route path="/admin-book-design-approvals" element={<AdminBookDesignApprovals />} />
            <Route path="/author-dashboard" element={<AuthorDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <CartSidebar />
      </div>
    </TooltipProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <TooltipProvider>
            <Router>
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <CartSidebar />
              </div>
              <Toaster />
              <Sonner />
            </Router>
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

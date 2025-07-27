import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "@/store";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import CartSidebar from "@/components/Cart/CartSidebar";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import BookDetails from "./pages/BookDetails";
import Subscriptions from "./pages/Subscriptions";
import Reader from "./pages/Reader";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import AuthorDashboard from './pages/AuthorDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Notifications from './pages/Notifications';
import EditProfile from './pages/EditProfile';
import PaymentSuccess from './pages/PaymentSuccess';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { getToken, authFetch } from '@/lib/api';
import AdminPlanManagement from '@/pages/AdminPlanManagement';
import AdminBookApprovals from './pages/AdminBookApprovals';
import AdminBookManagement from './pages/AdminBookManagement';

const queryClient = new QueryClient();

const AppContent = () => {
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

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
              <Route path="/author-dashboard" element={<AuthorDashboard />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
                              <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CartSidebar />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </Provider>
);

export default App;

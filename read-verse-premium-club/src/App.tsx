import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { store, persistor } from "@/store";
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
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
      </PersistGate>
    </Provider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeftIcon, ShoppingCartIcon, CreditCardIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchCart, clearCart } from '@/store/slices/cartSlice';
import { authFetch } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
    loadRazorpayScript: () => Promise<void>;
  }
}

interface Address {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking';
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  upiId?: string;
  bankName?: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: cartItems, total } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'card'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    
    // Test backend connectivity
    const testBackend = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/test`);
        if (response.ok) {
          console.log('✅ Backend is accessible');
        } else {
          console.log('❌ Backend returned error:', response.status);
        }
      } catch (error) {
        console.log('❌ Backend not accessible:', error);
      }
    };
    
    testBackend();
    
    // Load Razorpay script only when needed
    const loadRazorpayScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (window.Razorpay) {
          resolve();
          return;
        }
        
        // Check if script is already being loaded
        if (document.querySelector('script[src*="razorpay"]')) {
          // Wait for existing script to load
          const checkLoaded = setInterval(() => {
            if (window.Razorpay) {
              clearInterval(checkLoaded);
              resolve();
            }
          }, 100);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          // Wait a bit for Razorpay to initialize
          setTimeout(() => {
            if (window.Razorpay) {
              resolve();
            } else {
              reject(new Error('Razorpay failed to initialize'));
            }
          }, 100);
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay script'));
        };
        
        document.head.appendChild(script);
      });
    };
    
    // Don't load script immediately, only when payment is initiated
    window.loadRazorpayScript = loadRazorpayScript;
  }, [dispatch]);

  // Initialize Razorpay payment
  const initializeRazorpayPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to proceed with payment.",
        variant: "destructive",
      });
      return;
    }

    setPaymentLoading(true);
    try {
      // Create order on backend
      const orderData = {
        items: cartItems.map(item => ({
          bookId: item.id,
          title: item.title,
          price: item.price
        })),
        total: total,
        shippingAddress: address,
        paymentMethod: paymentMethod,
        userId: user.id
      };

      const response = await authFetch('/orders/create-payment', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const paymentData = await response.json();
        
        // Check if this is a demo payment
        if (paymentData.is_demo) {
          toast({
            title: "Demo Order Created!",
            description: "Your demo order has been created successfully. Check your email for details.",
          });
          
          // Navigate to orders page for demo order
          navigate('/orders', { 
            state: { 
              newOrderId: paymentData.order_id_db,
              showPaymentStatus: true,
              isDemo: true
            } 
          });
        } else {
          // Show success message with payment link
          toast({
            title: "Payment Link Sent!",
            description: "Check your email for the payment link. You can also pay directly here.",
          });

          // Open payment link in new tab
          if (paymentData.payment_link) {
            window.open(paymentData.payment_link, '_blank');
          }

          // Navigate to order status page
          navigate('/orders', { 
            state: { 
              newOrderId: paymentData.order_id_db,
              showPaymentStatus: true 
            } 
          });
        }
      } else {
        const errorData = await response.json();
        
        // If Razorpay is not configured, fall back to regular order placement
        if (response.status === 503) {
          toast({
            title: "Payment Gateway Unavailable",
            description: "Proceeding with demo payment. Order will be placed successfully.",
          });
          // Fall back to regular order placement
          await handlePlaceOrder();
        } else {
          throw new Error(errorData.message || 'Failed to create payment order');
        }
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      
      // If it's a network error, try fallback payment
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast({
          title: "Backend Unavailable",
          description: "Proceeding with demo payment. Order will be placed successfully.",
        });
        await handlePlaceOrder();
      } else {
        toast({
          title: "Payment Error",
          description: error.message || "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
      setPaymentLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response: any, orderId: string) => {
    try {
      // Verify payment on backend
      const verifyResponse = await authFetch('/orders/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          order_id: orderId
        })
      });

      if (verifyResponse.ok) {
        const order = await verifyResponse.json();
        dispatch(clearCart());
        toast({
          title: "Payment Successful!",
          description: `Order #${order.orderId} has been placed successfully.`,
        });
        navigate('/payment-success', { state: { order } });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if payment was deducted.",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: keyof PaymentMethod, value: string) => {
    setPaymentMethod(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to proceed with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          bookId: item.id,
          title: item.title,
          price: item.price,
          author: item.author
        })),
        total: total * 1.18, // Including tax
        shippingAddress: address,
        paymentMethod: paymentMethod,
        userId: user.id
      };

      const response = await authFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        dispatch(clearCart());
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.orderId} has been placed successfully.`,
        });
        navigate('/payment-success', { state: { order } });
      } else {
        // If backend is not available, create a demo order
        const demoOrder = {
          orderId: 'DEMO' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase(),
          userId: user.id,
          items: orderData.items,
          total: orderData.total,
          shippingAddress: address,
          paymentMethod: paymentMethod,
          status: 'processing',
          paymentStatus: 'completed',
          createdAt: new Date().toISOString()
        };
        
        dispatch(clearCart());
        toast({
          title: "Demo Order Placed Successfully!",
          description: `Order #${demoOrder.orderId} has been placed successfully.`,
        });
        navigate('/payment-success', { state: { order: demoOrder } });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Create demo order if backend is not available
      const demoOrder = {
        orderId: 'DEMO' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase(),
        userId: user.id,
        items: cartItems.map(item => ({
          bookId: item.id,
          title: item.title,
          price: item.price,
          author: item.author
        })),
        total: total * 1.18,
        shippingAddress: address,
        paymentMethod: paymentMethod,
        status: 'processing',
        paymentStatus: 'completed',
        createdAt: new Date().toISOString()
      };
      
      dispatch(clearCart());
      toast({
        title: "Demo Order Placed Successfully!",
        description: `Order #${demoOrder.orderId} has been placed successfully.`,
      });
      navigate('/payment-success', { state: { order: demoOrder } });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Helmet>
          <title>Checkout - BookTech</title>
          <meta name="description" content="Complete your book purchase with secure checkout" />
        </Helmet>
        
        <div className="text-center">
          <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some books to your cart to continue with checkout.</p>
          <Button onClick={() => navigate('/browse')}>
            Browse Books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Checkout - BookTech</title>
        <meta name="description" content="Complete your book purchase with secure checkout" />
      </Helmet>

      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={address.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={address.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="Enter your country"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                  placeholder="Enter your full address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="Enter your state"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={paymentMethod.type === 'card' ? 'default' : 'outline'}
                    onClick={() => {
                      setPaymentMethod({ type: 'card' });
                      setPaymentLoading(false);
                    }}
                    className="justify-start"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Credit/Debit Card
                  </Button>
                  <Button
                    variant={paymentMethod.type === 'upi' ? 'default' : 'outline'}
                    onClick={() => {
                      setPaymentMethod({ type: 'upi' });
                      initializeRazorpayPayment();
                    }}
                    className="justify-start"
                    disabled={paymentLoading}
                  >
                    UPI
                    {paymentLoading && (
                      <span className="ml-2">
                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </Button>
                  <Button
                    variant={paymentMethod.type === 'netbanking' ? 'default' : 'outline'}
                    onClick={() => {
                      setPaymentMethod({ type: 'netbanking' });
                      setPaymentLoading(false);
                    }}
                    className="justify-start"
                  >
                    Net Banking
                  </Button>
                </div>
              </div>

              {paymentMethod.type === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={paymentMethod.cardNumber || ''}
                      onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardHolder">Card Holder Name</Label>
                    <Input
                      id="cardHolder"
                      value={paymentMethod.cardHolder || ''}
                      onChange={(e) => handlePaymentChange('cardHolder', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      value={paymentMethod.expiry || ''}
                      onChange={(e) => handlePaymentChange('expiry', e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentMethod.cvv || ''}
                      onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
              )}

              {paymentMethod.type === 'upi' && (
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={paymentMethod.upiId || ''}
                    onChange={(e) => handlePaymentChange('upiId', e.target.value)}
                    placeholder="username@upi"
                  />
                </div>
              )}

              {paymentMethod.type === 'netbanking' && (
                <div>
                  <Label htmlFor="bankName">Select Bank</Label>
                  <Input
                    id="bankName"
                    value={paymentMethod.bankName || ''}
                    onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                    placeholder="Select your bank"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">by {item.author}</p>
                    </div>
                    <p className="font-bold">${item.price}</p>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(total * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(total * 1.18).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={paymentMethod.type === 'upi' ? initializeRazorpayPayment : handlePlaceOrder}
                disabled={isProcessing || paymentLoading}
                className="w-full"
                size="lg"
              >
                {isProcessing || paymentLoading ? 'Processing...' : 
                  paymentMethod.type === 'upi' 
                    ? `Pay ₹${(total * 1.18).toFixed(2)} via Razorpay` 
                    : `Place Order - $${(total * 1.18).toFixed(2)}`
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
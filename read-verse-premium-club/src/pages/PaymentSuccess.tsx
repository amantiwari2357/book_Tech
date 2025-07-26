import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Clear cart on successful payment
    dispatch(clearCart());
    
    // Get payment details from URL params
    const paymentId = searchParams.get('razorpay_payment_id');
    const paymentLinkId = searchParams.get('razorpay_payment_link_id');
    
    if (paymentId && paymentLinkId) {
      // Payment was successful
      setLoading(false);
      // You can fetch order details here if needed
    } else {
      setLoading(false);
    }
  }, [searchParams, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your purchase! Your payment has been processed successfully.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• You'll receive an email confirmation</li>
              <li>• Your order will be processed by the author</li>
              <li>• Track your order status in your dashboard</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/customer-dashboard')}
              className="w-full"
            >
              View My Orders
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeftIcon, 
  ShoppingBagIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';
import { useAppSelector } from '@/store';
import { authFetch } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  author: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [checkingPayment, setCheckingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
    
    // Check if we have a new order from checkout
    if (location.state?.newOrderId) {
      const newOrderId = location.state.newOrderId;
      const showPaymentStatus = location.state.showPaymentStatus;
      
      if (showPaymentStatus) {
        // Check payment status for new order
        checkPaymentStatus(newOrderId);
      }
    }
  }, [user, navigate, location.state]);

  const fetchOrders = async () => {
    try {
      const response = await authFetch('/orders'); // Fetches user's orders
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    setCheckingPayment(orderId);
    try {
      const response = await authFetch(`/orders/payment-status/${orderId}`);
      if (response.ok) {
        const paymentData = await response.json();
        
        // Update the order in the list
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, ...paymentData }
              : order
          );
          return updatedOrders;
        });
        
        if (paymentData.paymentStatus === 'completed') {
          toast({
            title: "Payment Completed!",
            description: `Order #${orderId} payment has been received.`,
          });
        } else {
          toast({
            title: "Payment Pending",
            description: `Order #${orderId} payment is still pending.`,
          });
        }
      } else {
        throw new Error('Failed to check payment status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingPayment(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>My Orders - BookTech</title>
        <meta name="description" content="View your order history and track order status" />
      </Helmet>

      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <Button onClick={() => navigate('/browse')}>
            Browse Books
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      Order #{order.orderId}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge 
                      variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}
                      className={order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                    </Badge>
                    {order.paymentStatus === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => checkPaymentStatus(order.orderId)}
                        disabled={checkingPayment === order.orderId}
                      >
                        {checkingPayment === order.orderId ? (
                          <RefreshIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshIcon className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Total: ₹{order.total}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircleIcon className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <Badge 
                      variant={selectedOrder.paymentStatus === 'completed' ? 'default' : 'secondary'}
                      className={selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {selectedOrder.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600">by {item.author}</p>
                        </div>
                        <p className="font-bold">₹{item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₹{selectedOrder.total}</span>
                </div>
                
                {selectedOrder.paymentStatus === 'pending' && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Payment is pending. Please complete your payment to proceed with the order.
                    </p>
                    <Button
                      className="mt-2"
                      onClick={() => {
                        checkPaymentStatus(selectedOrder.orderId);
                        setSelectedOrder(null);
                      }}
                      disabled={checkingPayment === selectedOrder.orderId}
                    >
                      {checkingPayment === selectedOrder.orderId ? (
                        <>
                          <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshIcon className="h-4 w-4 mr-2" />
                          Check Payment Status
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCartIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  CameraIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Order {
  _id: string;
  userId: string;
  items: Array<{
    bookId: string;
    title: string;
    author: string;
    price: number;
    coverImage?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveryAddress?: string;
  invoiceUrl?: string;
}

interface ReturnRequest {
  _id: string;
  orderId: string;
  reason: string;
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const Orders: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnImages, setReturnImages] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchReturns();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/orders/my-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    try {
      const res = await authFetch('/orders/returns');
      if (res.ok) {
        const data = await res.json();
        setReturns(data);
      }
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      processing: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getOrderProgress = (status: string) => {
    const progressMap = {
      pending: 25,
      processing: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0
    };
    
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getReturnStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const downloadInvoice = async (orderId: string) => {
    try {
      const res = await authFetch(`/orders/${orderId}/invoice`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const initiateReturn = async () => {
    if (!selectedOrder || !returnReason) return;

    try {
      const formData = new FormData();
      formData.append('orderId', selectedOrder._id);
      formData.append('reason', returnReason);
      formData.append('description', returnDescription);
      
      returnImages.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const res = await authFetch('/orders/returns', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setShowReturnModal(false);
        setSelectedOrder(null);
        setReturnReason('');
        setReturnDescription('');
        setReturnImages([]);
        fetchReturns();
      }
    } catch (error) {
      console.error('Failed to initiate return:', error);
    }
  };

  const reorder = async (order: Order) => {
    try {
      const res = await authFetch('/cart/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: order._id })
      });

      if (res.ok) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer-dashboard')}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Orders & Returns</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="returns">Returns & Refunds</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getOrderStatusBadge(order.status)}
                          {getOrderStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                              <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm sm:text-base truncate">
                                  {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                  by {item.author}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Ordered</span>
                            <span>Processing</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${getOrderProgress(order.status)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Total Amount: ₹{order.totalAmount}</p>
                            {order.trackingNumber && (
                              <p className="text-gray-600">Tracking: {order.trackingNumber}</p>
                            )}
                            {order.estimatedDelivery && (
                              <p className="text-gray-600">
                                Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">
                              <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              View Details
                            </Button>
                            {order.status === 'shipped' && (
                              <Button variant="outline" size="sm">
                                <TruckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Track Package
                              </Button>
                            )}
                            {order.status === 'delivered' && (
                              <Button variant="outline" size="sm" onClick={() => downloadInvoice(order._id)}>
                                <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Download Invoice
                              </Button>
                            )}
                            {order.status === 'delivered' && (
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedOrder(order);
                                setShowReturnModal(true);
                              }}>
                                <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Return Item
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => reorder(order)}>
                              <ArrowPathIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Re-order
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {orders.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <ShoppingCartIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-4">Start shopping to see your order history here.</p>
                      <Button onClick={() => navigate('/browse')}>
                        Start Shopping
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="returns" className="space-y-6">
            <div className="space-y-6">
              {returns.map((returnRequest) => (
                <Card key={returnRequest._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Return #{returnRequest._id.slice(-8)}</CardTitle>
                        <p className="text-sm text-gray-500">
                          Requested on {new Date(returnRequest.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getReturnStatusBadge(returnRequest.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">Reason: {returnRequest.reason}</p>
                        <p className="text-sm text-gray-600 mt-1">{returnRequest.description}</p>
                      </div>
                      
                      {returnRequest.images.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Attached Images:</p>
                          <div className="flex space-x-2">
                            {returnRequest.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Return image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ChatBubbleLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Contact Support
                        </Button>
                        {returnRequest.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            <XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {returns.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests</h3>
                    <p className="text-gray-500">You haven't initiated any returns yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Initiate Return</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a reason</option>
                  <option value="damaged">Item damaged</option>
                  <option value="wrong_item">Wrong item received</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="quality_issue">Quality issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Please describe the issue..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Upload Images (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setReturnImages(Array.from(e.target.files || []))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedOrder(null);
                  setReturnReason('');
                  setReturnDescription('');
                  setReturnImages([]);
                }}
              >
                Cancel
              </Button>
              <Button onClick={initiateReturn} disabled={!returnReason}>
                Submit Return Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 
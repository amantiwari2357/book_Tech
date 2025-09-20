import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StarIcon } from '@heroicons/react/24/outline';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShoppingCartIcon, 
  TruckIcon, 
  UserIcon, 
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  bookTitle: string;
  bookId: string;
  orderType: 'ebook' | 'hardcopy';
  amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  deliveryBoy?: {
    _id: string;
    name: string;
    phone: string;
    rating: number;
  };
  trackingId?: string;
  notes?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
}

interface DeliveryBoy {
  _id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalDeliveries: number;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

const AuthorOrderManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ebook' | 'hardcopy'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignDeliveryOpen, setAssignDeliveryOpen] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (user && user.role === 'author') {
      fetchOrderData();
    }
  }, [user]);

  const fetchOrderData = async () => {
    try {
      const [ordersRes, deliveryBoysRes] = await Promise.all([
        authFetch('/author/orders'),
        authFetch('/author/delivery-boys')
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (deliveryBoysRes.ok) {
        const deliveryBoysData = await deliveryBoysRes.json();
        setDeliveryBoys(deliveryBoysData);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await authFetch(`/author/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders => 
          orders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus as any }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAssignDeliveryBoy = async () => {
    if (!selectedOrder || !selectedDeliveryBoy) return;

    try {
      const res = await authFetch(`/author/orders/${selectedOrder._id}/assign-delivery`, {
        method: 'POST',
        body: JSON.stringify({ 
          deliveryBoyId: selectedDeliveryBoy,
          notes: orderNotes
        }),
      });

      if (res.ok) {
        const deliveryBoy = deliveryBoys.find(db => db._id === selectedDeliveryBoy);
        setOrders(orders => 
          orders.map(order => 
            order._id === selectedOrder._id 
              ? { 
                  ...order, 
                  deliveryBoy: deliveryBoy ? {
                    _id: deliveryBoy._id,
                    name: deliveryBoy.name,
                    phone: deliveryBoy.phone,
                    rating: deliveryBoy.rating
                  } : undefined
                }
              : order
          )
        );
        setAssignDeliveryOpen(false);
        setSelectedDeliveryBoy('');
        setOrderNotes('');
      }
    } catch (error) {
      console.error('Error assigning delivery boy:', error);
    }
  };

  const openAssignDelivery = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryBoy('');
    setOrderNotes('');
    setAssignDeliveryOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
    return matchesStatus && matchesType;
  });

  if (!user || user.role !== 'author') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and delivery assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">{orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length}</p>
                </div>
                <TruckIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ebook">E-Book</SelectItem>
              <SelectItem value="hardcopy">Hard Copy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Order</th>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Payment</th>
                    <th className="text-left p-4">Delivery Boy</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.bookTitle}</p>
                          <p className="text-sm text-gray-500">#{order.orderId}</p>
                          <p className="text-xs text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {order.customerPhone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {order.orderType}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">${order.amount}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {order.deliveryBoy ? (
                          <div>
                            <p className="text-sm font-medium">{order.deliveryBoy.name}</p>
                            <p className="text-xs text-gray-500">{order.deliveryBoy.phone}</p>
                            <div className="flex items-center">
                              <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs ml-1">{order.deliveryBoy.rating}</span>
                            </div>
                          </div>
                        ) : (
                          order.orderType === 'hardcopy' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAssignDelivery(order)}
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              // Open order details modal
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order._id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order._id, 'processing')}
                            >
                              Process
                            </Button>
                          )}
                          {order.status === 'processing' && order.orderType === 'hardcopy' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order._id, 'shipped')}
                            >
                              Ship
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Assign Delivery Boy Modal */}
        <Dialog open={assignDeliveryOpen} onOpenChange={setAssignDeliveryOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Delivery Boy</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Order Details</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedOrder.bookTitle}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customerAddress}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Select Delivery Boy</Label>
                  <Select value={selectedDeliveryBoy} onValueChange={setSelectedDeliveryBoy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose delivery boy" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryBoys.filter(db => db.isAvailable).map(deliveryBoy => (
                        <SelectItem key={deliveryBoy._id} value={deliveryBoy._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{deliveryBoy.name}</span>
                            <div className="flex items-center ml-2">
                              <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs ml-1">{deliveryBoy.rating}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Notes (Optional)</Label>
                  <Textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAssignDeliveryBoy} disabled={!selectedDeliveryBoy}>
                    Assign Delivery Boy
                  </Button>
                  <Button variant="outline" onClick={() => setAssignDeliveryOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AuthorOrderManagement;

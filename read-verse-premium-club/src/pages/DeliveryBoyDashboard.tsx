import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';

interface DeliveryBoyStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  totalEarnings: number;
  todayEarnings: number;
  rating: number;
  totalReviews: number;
}

interface Delivery {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  bookTitle: string;
  amount: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  deliveryFee: number;
  distance: number;
  estimatedTime: number;
}

const DeliveryBoyDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DeliveryBoyStats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user && user.role === 'delivery_boy') {
      fetchDeliveryData();
    }
  }, [user]);

  const fetchDeliveryData = async () => {
    try {
      const [statsRes, deliveriesRes] = await Promise.all([
        authFetch('/delivery-boy/stats'),
        authFetch('/delivery-boy/deliveries')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        setDeliveries(deliveriesData);
      }
    } catch (error) {
      console.error('Error fetching delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedDelivery || !newStatus) return;

    try {
      const res = await authFetch(`/delivery-boy/deliveries/${selectedDelivery._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes
        }),
      });

      if (res.ok) {
        setDeliveries(deliveries => 
          deliveries.map(delivery => 
            delivery._id === selectedDelivery._id 
              ? { 
                  ...delivery, 
                  status: newStatus as any,
                  ...(newStatus === 'picked_up' && { pickedUpAt: new Date().toISOString() }),
                  ...(newStatus === 'delivered' && { deliveredAt: new Date().toISOString() })
                }
              : delivery
          )
        );
        setUpdateStatusOpen(false);
        setNotes('');
        setNewStatus('');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const openStatusUpdate = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setNewStatus('');
    setNotes('');
    setUpdateStatusOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'assigned': return 'picked_up';
      case 'picked_up': return 'in_transit';
      case 'in_transit': return 'delivered';
      default: return currentStatus;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => 
    statusFilter === 'all' || delivery.status === statusFilter
  );

  if (!user || user.role !== 'delivery_boy') {
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
          <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <TruckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDeliveries || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedDeliveries || 0}</div>
              <p className="text-xs text-muted-foreground">Successful deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingDeliveries || 0}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.todayEarnings || 0}</div>
              <p className="text-xs text-muted-foreground">Total: ${stats?.totalEarnings || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Card */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Your Rating</h3>
                  <p className="text-gray-600">Based on customer feedback</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats?.rating || 0}</div>
                  <div className="text-sm text-gray-500">({stats?.totalReviews || 0} reviews)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Deliveries */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deliveries.slice(0, 5).map(delivery => (
                      <div key={delivery._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{delivery.bookTitle}</p>
                          <p className="text-sm text-gray-500">{delivery.customerName}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(delivery.status)}>
                          {delivery.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={() => setActiveTab('deliveries')}>
                    <TruckIcon className="h-4 w-4 mr-2" />
                    View All Deliveries
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    Update Location
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MapIcon className="h-4 w-4 mr-2" />
                    Navigation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deliveries" className="mt-6">
            {/* Filter */}
            <div className="mb-6">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deliveries Table */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Order</th>
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Address</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveries.map(delivery => (
                        <tr key={delivery._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{delivery.bookTitle}</p>
                              <p className="text-sm text-gray-500">Order #{delivery.orderId}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{delivery.customerName}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {delivery.customerPhone}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs">
                              <p className="text-sm">{delivery.customerAddress}</p>
                              <p className="text-xs text-gray-500">{delivery.distance} km</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">${delivery.amount}</p>
                              <p className="text-sm text-green-600">Fee: ${delivery.deliveryFee}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusBadgeColor(delivery.status)}>
                              {delivery.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openStatusUpdate(delivery)}
                              >
                                Update Status
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`tel:${delivery.customerPhone}`)}
                              >
                                <PhoneIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Update Modal */}
        <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Delivery Status</DialogTitle>
            </DialogHeader>
            {selectedDelivery && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <Badge className={getStatusBadgeColor(selectedDelivery.status)}>
                    {selectedDelivery.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Update to</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDelivery.status === 'assigned' && (
                        <SelectItem value="picked_up">Picked Up</SelectItem>
                      )}
                      {selectedDelivery.status === 'picked_up' && (
                        <SelectItem value="in_transit">In Transit</SelectItem>
                      )}
                      {selectedDelivery.status === 'in_transit' && (
                        <>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about the delivery..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                    Update Status
                  </Button>
                  <Button variant="outline" onClick={() => setUpdateStatusOpen(false)}>
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

export default DeliveryBoyDashboard;

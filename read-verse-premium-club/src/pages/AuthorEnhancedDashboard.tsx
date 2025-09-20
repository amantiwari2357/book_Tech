import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  EyeIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  TruckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface AuthorStats {
  totalBooks: number;
  totalEarnings: number;
  pendingEarnings: number;
  totalSales: number;
  totalViews: number;
  totalClicks: number;
  engagementRate: number;
  monthlyEarnings: number;
  pendingSettlements: number;
}

interface Book {
  _id: string;
  title: string;
  price: number;
  sales: number;
  views: number;
  clicks: number;
  earnings: number;
  rating: number;
  totalReviews: number;
  coverImage?: string;
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
}

interface Settlement {
  _id: string;
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  paymentMethod: string;
}

interface Order {
  _id: string;
  bookTitle: string;
  customerName: string;
  orderType: 'ebook' | 'hardcopy';
  amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryBoy?: {
    name: string;
    phone: string;
  };
  trackingId?: string;
}

const AuthorEnhancedDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookAnalyticsOpen, setBookAnalyticsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'author') {
      fetchAuthorData();
    }
  }, [user]);

  const fetchAuthorData = async () => {
    try {
      const [statsRes, booksRes, settlementsRes, ordersRes] = await Promise.all([
        authFetch('/author/dashboard/stats'),
        authFetch('/author/books'),
        authFetch('/author/settlements'),
        authFetch('/author/orders')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData);
      }

      if (settlementsRes.ok) {
        const settlementsData = await settlementsRes.json();
        setSettlements(settlementsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching author data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlementRequest = async () => {
    try {
      const res = await authFetch('/author/settlements/request', {
        method: 'POST',
        body: JSON.stringify({ amount: stats?.pendingEarnings || 0 }),
      });
      if (res.ok) {
        fetchAuthorData(); // Refresh data
      }
    } catch (error) {
      console.error('Error requesting settlement:', error);
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': 
      case 'completed': 
      case 'delivered': 
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': 
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': 
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
              <p className="text-xs text-muted-foreground">Published books</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalEarnings || 0}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.pendingEarnings || 0}</div>
              <p className="text-xs text-muted-foreground">Available for settlement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
              <p className="text-xs text-muted-foreground">Book page views</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
              <p className="text-xs text-muted-foreground">Books sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
              <p className="text-xs text-muted-foreground">User interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.engagementRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Click-through rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.monthlyEarnings || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate('/author/create-book')}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Book
                </Button>
                <Button variant="outline" onClick={() => navigate('/author/book-design')}>
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Design Book
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSettlementRequest}
                  disabled={!stats?.pendingEarnings || stats.pendingEarnings <= 0}
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Request Settlement
                </Button>
                <Button variant="outline" onClick={() => navigate('/author/analytics')}>
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Books */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.slice(0, 5).map(book => (
                      <div key={book._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpenIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-gray-500">${book.price} • {book.sales} sales</p>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeColor(book.status)}>
                          {book.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.bookTitle}</p>
                          <p className="text-sm text-gray-500">{order.customerName} • ${order.amount}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Book</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Sales</th>
                        <th className="text-left p-4">Views</th>
                        <th className="text-left p-4">Earnings</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map(book => (
                        <tr key={book._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              {book.coverImage ? (
                                <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
                              ) : (
                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                  <BookOpenIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{book.title}</p>
                                <p className="text-sm text-gray-500">Rating: {book.rating}/5 ({book.totalReviews} reviews)</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">${book.price}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{book.sales}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{book.views}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-green-600">${book.earnings}</p>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusBadgeColor(book.status)}>
                              {book.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setBookAnalyticsOpen(true);
                                }}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/author/edit-book/${book._id}`)}
                              >
                                Edit
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

          <TabsContent value="earnings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Earnings</span>
                      <span className="font-bold text-green-600">${stats?.totalEarnings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pending Earnings</span>
                      <span className="font-bold text-orange-600">${stats?.pendingEarnings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Earnings</span>
                      <span className="font-bold text-blue-600">${stats?.monthlyEarnings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pending Settlements</span>
                      <span className="font-bold text-purple-600">{stats?.pendingSettlements || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settlement Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Settlement Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {settlements.map(settlement => (
                      <div key={settlement._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">${settlement.amount}</p>
                          <p className="text-sm text-gray-500">{settlement.paymentMethod}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(settlement.status)}>
                          {settlement.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
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
                        <th className="text-left p-4">Delivery Boy</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.bookTitle}</p>
                              <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{order.customerName}</p>
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
                            {order.deliveryBoy ? (
                              <div>
                                <p className="text-sm font-medium">{order.deliveryBoy.name}</p>
                                <p className="text-xs text-gray-500">{order.deliveryBoy.phone}</p>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/author/assign-delivery/${order._id}`)}
                              >
                                <TruckIcon className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
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
                              {order.status === 'processing' && (
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
          </TabsContent>
        </Tabs>

        {/* Book Analytics Modal */}
        <Dialog open={bookAnalyticsOpen} onOpenChange={setBookAnalyticsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Book Analytics: {selectedBook?.title}</DialogTitle>
            </DialogHeader>
            {selectedBook && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedBook.views}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-green-600">{selectedBook.clicks}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedBook.sales}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-orange-600">${selectedBook.earnings}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Click-through Rate</p>
                    <p className="text-xl font-bold">
                      {selectedBook.views > 0 ? ((selectedBook.clicks / selectedBook.views) * 100).toFixed(2) : 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-xl font-bold">
                      {selectedBook.clicks > 0 ? ((selectedBook.sales / selectedBook.clicks) * 100).toFixed(2) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AuthorEnhancedDashboard;

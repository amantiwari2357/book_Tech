import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpenIcon, 
  HeartIcon, 
  ClockIcon, 
  StarIcon,
  BellIcon,
  ShoppingCartIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DownloadIcon,
  ShareIcon,
  BookmarkIcon,
  TrendingUpIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';

interface Order {
  _id: string;
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
    price: number;
  };
  amount: number;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveryAddress?: string;
}

interface Notification {
  _id: string;
  message: string;
  type: 'order_update' | 'payment' | 'delivery' | 'promotion' | 'system';
  isRead: boolean;
  createdAt: string;
}

interface ReadingStats {
  booksRead: number;
  pagesRead: number;
  readingTime: number;
  currentStreak: number;
  totalBooks: number;
  favoriteGenres: string[];
  monthlyProgress: {
    month: string;
    booksRead: number;
    pagesRead: number;
  }[];
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [currentlyReading, setCurrentlyReading] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchNotifications();
      fetchReadingStats();
      fetchCurrentlyReading();
      fetchFavorites();
      
      // Real-time notifications (polling every 30 seconds)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const fetchOrders = async () => {
    try {
      const res = await authFetch('/orders/my-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchReadingStats = async () => {
    try {
      const res = await authFetch('/users/reading-stats');
      if (res.ok) {
        const data = await res.json();
        setReadingStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch reading stats:', error);
    }
  };

  const fetchCurrentlyReading = async () => {
    try {
      const res = await authFetch('/books/currently-reading');
      if (res.ok) {
        const data = await res.json();
        setCurrentlyReading(data);
      }
    } catch (error) {
      console.error('Failed to fetch currently reading:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await authFetch('/books/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await authFetch(`/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
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
      confirmed: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      order_update: TruckIcon,
      payment: ShoppingCartIcon,
      delivery: CheckCircleIcon,
      promotion: TrendingUpIcon,
      system: BellIcon
    };
    return iconMap[type as keyof typeof iconMap] || BellIcon;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Real-time Notification Bell */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
            </div>
            <div className="relative">
              <Button variant="outline" size="sm" className="relative">
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Read</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingStats?.booksRead || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingStats?.readingTime || 0}h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <HeartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
              <p className="text-xs text-muted-foreground">Saved books</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Currently Reading */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpenIcon className="w-5 h-5 mr-2" />
                    Currently Reading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentlyReading.map((book) => (
                      <div key={book._id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="w-12 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <h3 className="font-medium">{book.title}</h3>
                          <p className="text-sm text-gray-500">{book.author}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${book.progress || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{book.progress || 0}% completed</p>
                        </div>
                        <Button size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {currentlyReading.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No books currently reading</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BellIcon className="w-5 h-5 mr-2" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div 
                          key={notification._id} 
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                          }`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <Icon className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                    {notifications.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No notifications</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reading Progress Chart */}
            {readingStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Reading Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readingStats.monthlyProgress?.map((month, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium">{month.month}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{month.booksRead} books</span>
                            <span>{month.pagesRead} pages</span>
                          </div>
                          <Progress value={(month.booksRead / Math.max(...readingStats.monthlyProgress.map(m => m.booksRead))) * 100} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-20 bg-gray-200 rounded"></div>
                          <div>
                            <h3 className="font-medium">{order.book.title}</h3>
                            <p className="text-sm text-gray-500">by {order.book.author}</p>
                            <p className="text-sm text-gray-500">₹{order.amount}</p>
                            <p className="text-xs text-gray-400">
                              Ordered: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            {getOrderStatusBadge(order.orderStatus)}
                            {getOrderStatusBadge(order.paymentStatus)}
                          </div>
                          
                          {/* Animated Progress Bar */}
                          <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Order Placed</span>
                              <span>Confirmed</span>
                              <span>Shipped</span>
                              <span>Delivered</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${getOrderProgress(order.orderStatus)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {order.trackingNumber && (
                            <p className="text-xs text-gray-500">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                          
                          {order.estimatedDelivery && (
                            <p className="text-xs text-gray-500">
                              Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Order Actions */}
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {order.orderStatus === 'shipped' && (
                          <Button variant="outline" size="sm">
                            <TruckIcon className="w-4 h-4 mr-1" />
                            Track Package
                          </Button>
                        )}
                        {order.orderStatus === 'delivered' && (
                          <Button variant="outline" size="sm">
                            <DownloadIcon className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reading" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reading Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Reading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Books Read</span>
                      <span className="font-bold">{readingStats?.booksRead || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pages Read</span>
                      <span className="font-bold">{readingStats?.pagesRead || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Reading Time</span>
                      <span className="font-bold">{readingStats?.readingTime || 0}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Current Streak</span>
                      <span className="font-bold">{readingStats?.currentStreak || 0} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Favorite Genres */}
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {readingStats?.favoriteGenres?.map((genre, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{genre}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} unread</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <div 
                        key={notification._id} 
                        className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'
                        }`}
                        onClick={() => markNotificationAsRead(notification._id)}
                      >
                        <Icon className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                  {notifications.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No notifications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  My Favorites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((book) => (
                    <div key={book._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                      <h3 className="font-medium">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.author}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{book.rating || 0}</span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Read
                        </Button>
                        <Button variant="outline" size="sm">
                          <ShareIcon className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                  {favorites.length === 0 && (
                    <p className="text-gray-500 text-center py-8 col-span-full">No favorite books yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard; 
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon,
  ChartBarIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CogIcon,
  CreditCardIcon,
  GiftIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  WalletIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  FireIcon,
  AcademicCapIcon,
  BookmarkSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  CurrencyRupeeIcon
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

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  addresses: Array<{
    _id: string;
    type: 'home' | 'work' | 'other';
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  wallet: {
    balance: number;
    points: number;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [currentlyReading, setCurrentlyReading] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Real-time updates (polling every 30 seconds)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchNotifications(),
        fetchReadingStats(),
        fetchCurrentlyReading(),
        fetchFavorites(),
        fetchUserProfile()
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchUserProfile = async () => {
    try {
      const res = await authFetch('/users/profile');
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
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

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      order_update: ShoppingCartIcon,
      payment: CreditCardIcon,
      delivery: TruckIcon,
      promotion: GiftIcon,
      system: CogIcon
    };
    
    const Icon = iconMap[type as keyof typeof iconMap] || BellIcon;
    return <Icon className="w-4 h-4" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
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
              <h1 className="text-xl font-bold text-gray-900">Customer Dashboard</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Welcome back, {userProfile?.name || user.name}!
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="relative"
              >
                <BellIcon className="w-4 h-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <ShoppingCartIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Books Read</p>
                  <p className="text-2xl font-bold">{readingStats?.booksRead || 0}</p>
                </div>
                <BookOpenIcon className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Wallet Balance</p>
                  <p className="text-2xl font-bold">₹{userProfile?.wallet?.balance || 0}</p>
                </div>
                <WalletIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Loyalty Points</p>
                  <p className="text-2xl font-bold">{userProfile?.wallet?.points || 0}</p>
                </div>
                <StarIcon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/orders')}>
            <CardContent className="p-6 text-center">
              <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold text-lg mb-2">Orders & Returns</h3>
              <p className="text-sm text-gray-600">Track orders, download invoices, initiate returns</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/wishlist')}>
            <CardContent className="p-6 text-center">
              <HeartIcon className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="font-semibold text-lg mb-2">Wishlist & Cart</h3>
              <p className="text-sm text-gray-600">Manage wishlist, sync cart across devices</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/library')}>
            <CardContent className="p-6 text-center">
              <BookmarkIcon className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold text-lg mb-2">My Library</h3>
              <p className="text-sm text-gray-600">Download eBooks, track reading progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/reviews')}>
            <CardContent className="p-6 text-center">
              <StarIcon className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="font-semibold text-lg mb-2">Reviews & Ratings</h3>
              <p className="text-sm text-gray-600">Write reviews, rate books, interact</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/coupons')}>
            <CardContent className="p-6 text-center">
              <GiftIcon className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold text-lg mb-2">Coupons & Points</h3>
              <p className="text-sm text-gray-600">Apply coupons, redeem loyalty points</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/support')}>
            <CardContent className="p-6 text-center">
              <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
              <p className="text-sm text-gray-600">Live chat, raise tickets, get help</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/security')}>
            <CardContent className="p-6 text-center">
              <ShieldCheckIcon className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
              <h3 className="font-semibold text-lg mb-2">Security & Privacy</h3>
              <p className="text-sm text-gray-600">2FA, device management, privacy settings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
            <CardContent className="p-6 text-center">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-cyan-600" />
              <h3 className="font-semibold text-lg mb-2">Analytics & Insights</h3>
              <p className="text-sm text-gray-600">Reading stats, spending charts, insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm sm:text-base">
                <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-10 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.items && order.items.length > 0 ? order.items[0].title : 'Unknown Book'}
                      </p>
                      <p className="text-xs text-gray-500">₹{order.totalAmount || 0}</p>
                    </div>
                    {getOrderStatusBadge(order.status)}
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reading Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm sm:text-base">
                <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Reading Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readingStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{readingStats.booksRead}</p>
                      <p className="text-xs text-gray-500">Books Read</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{readingStats.pagesRead}</p>
                      <p className="text-xs text-gray-500">Pages Read</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Streak</span>
                      <span className="font-medium">{readingStats.currentStreak} days</span>
                    </div>
                    <Progress value={(readingStats.currentStreak / 30) * 100} />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reading data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 
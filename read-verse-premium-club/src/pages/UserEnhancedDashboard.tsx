import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon as ClockIconOutline,
  UserGroupIcon,
  SparklesIcon,
  TrophyIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  totalBooks: number;
  totalOrders: number;
  totalSpent: number;
  readingTime: number;
  booksRead: number;
  booksInProgress: number;
  wishlistItems: number;
  reviewsWritten: number;
  readingStreak: number;
  level: number;
  points: number;
  nextLevelPoints: number;
}

interface Order {
  _id: string;
  orderId: string;
  bookTitle: string;
  bookId: string;
  author: string;
  orderType: 'ebook' | 'hardcopy';
  amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  trackingId?: string;
  deliveryBoy?: {
    name: string;
    phone: string;
    rating: number;
  };
  estimatedDelivery?: string;
  currentLocation?: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage?: string;
  price: number;
  category: string;
  rating: number;
  totalReviews: number;
  isInLibrary: boolean;
  isInWishlist: boolean;
  readingProgress: number;
  lastRead?: string;
  purchaseDate: string;
  readingTime: number;
}

interface ReadingHistory {
  bookId: string;
  bookTitle: string;
  author: string;
  coverImage?: string;
  readingTime: number;
  progress: number;
  lastRead: string;
  completed: boolean;
}

interface Recommendation {
  _id: string;
  title: string;
  author: string;
  coverImage?: string;
  price: number;
  category: string;
  rating: number;
  reason: string;
  confidence: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'reading' | 'recommendation' | 'promotion' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

const UserEnhancedDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [statsRes, ordersRes, booksRes, historyRes, recommendationsRes, notificationsRes] = await Promise.all([
        authFetch('/user/dashboard/stats'),
        authFetch('/user/orders'),
        authFetch('/user/library'),
        authFetch('/user/reading-history'),
        authFetch('/user/recommendations'),
        authFetch('/user/notifications')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setReadingHistory(historyData);
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json();
        setRecommendations(recommendationsData);
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const res = await authFetch(`/user/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications(notifications => 
          notifications.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
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

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'processing': return <CogIcon className="h-4 w-4" />;
      case 'shipped': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (!user || user.role !== 'user') {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 mt-2">Your personal reading dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/browse')}>
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Browse Books
              </Button>
              <Button onClick={() => navigate('/wishlist')}>
                <HeartIcon className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Books in Library</p>
                  <p className="text-3xl font-bold">{stats?.totalBooks || 0}</p>
                  <p className="text-blue-100 text-xs">+{stats?.booksInProgress || 0} reading</p>
                </div>
                <BookOpenIcon className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Reading Time</p>
                  <p className="text-3xl font-bold">{Math.floor((stats?.readingTime || 0) / 60)}h</p>
                  <p className="text-green-100 text-xs">{stats?.readingStreak || 0} day streak</p>
                </div>
                <ClockIcon className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                  <p className="text-purple-100 text-xs">${stats?.totalSpent || 0} spent</p>
                </div>
                <ShoppingCartIcon className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Reader Level</p>
                  <p className="text-3xl font-bold">{stats?.level || 1}</p>
                  <p className="text-orange-100 text-xs">{stats?.points || 0} points</p>
                </div>
                <TrophyIcon className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        {stats && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Reader Level Progress</h3>
                  <p className="text-gray-600">Level {stats.level} • {stats.points} / {stats.nextLevelPoints} points</p>
                </div>
                <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  Level {stats.level}
                </Badge>
              </div>
              <Progress value={(stats.points / stats.nextLevelPoints) * 100} className="h-3" />
              <p className="text-sm text-gray-500 mt-2">
                {stats.nextLevelPoints - stats.points} more points to reach Level {stats.level + 1}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="recommendations">Discover</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map(order => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getOrderStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{order.bookTitle}</p>
                            <p className="text-xs text-gray-500">#{order.orderId}</p>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No orders yet</p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </Button>
                </CardContent>
              </Card>

              {/* Currently Reading */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    Currently Reading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.filter(book => book.readingProgress > 0 && book.readingProgress < 100).slice(0, 2).map(book => (
                      <div key={book._id} className="space-y-2">
                        <div className="flex items-center space-x-3">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpenIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{book.title}</p>
                            <p className="text-xs text-gray-500">by {book.author}</p>
                          </div>
                        </div>
                        <Progress value={book.readingProgress} className="h-2" />
                        <p className="text-xs text-gray-500">{book.readingProgress}% complete</p>
                      </div>
                    ))}
                    {books.filter(book => book.readingProgress > 0 && book.readingProgress < 100).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No books in progress</p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('library')}>
                    View Library
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LightBulbIcon className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => navigate('/browse')}>
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Browse Books
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/wishlist')}>
                    <HeartIcon className="h-4 w-4 mr-2" />
                    View Wishlist
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/wallet')}>
                    <WalletIcon className="h-4 w-4 mr-2" />
                    Wallet
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Order</th>
                        <th className="text-left p-4">Book</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <p className="font-medium">#{order.orderId}</p>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.bookTitle}</p>
                              <p className="text-sm text-gray-500">by {order.author}</p>
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
                            <div className="flex items-center space-x-2">
                              {getOrderStatusIcon(order.status)}
                              <Badge className={getStatusBadgeColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openOrderDetails(order)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map(book => (
                    <div key={book._id} className="bg-white rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpenIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-100 text-green-800">
                            Owned
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                        <div className="flex items-center gap-1 mb-3">
                          {renderStars(book.rating)}
                          <span className="text-sm text-gray-500 ml-1">({book.totalReviews})</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{book.readingProgress}%</span>
                          </div>
                          <Progress value={book.readingProgress} className="h-2" />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            className="flex-1"
                            onClick={() => navigate(`/ebook-reader/${book._id}`)}
                          >
                            <BookOpenIcon className="h-4 w-4 mr-1" />
                            Read
                          </Button>
                          <Button variant="outline" size="sm">
                            <ShareIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reading" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reading History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readingHistory.map(history => (
                    <div key={history.bookId} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {history.coverImage ? (
                        <img src={history.coverImage} alt={history.bookTitle} className="w-16 h-20 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpenIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{history.bookTitle}</h3>
                        <p className="text-gray-600 text-sm">by {history.author}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{Math.floor(history.readingTime / 60)}h {history.readingTime % 60}m read</span>
                          <span>Last read: {new Date(history.lastRead).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={history.completed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {history.completed ? "Completed" : `${history.progress}%`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map(book => (
                    <div key={book._id} className="bg-white rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpenIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            <SparklesIcon className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(book.rating)}
                          <span className="text-sm text-gray-500 ml-1">({book.rating})</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{book.reason}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${book.price}</span>
                          <Button size="sm">
                            <ShoppingCartIcon className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div 
                      key={notification._id} 
                      className={`p-4 rounded-lg border ${
                        notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification._id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Modal */}
        <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Order ID</Label>
                    <p className="text-lg">#{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="flex items-center space-x-2">
                      {getOrderStatusIcon(selectedOrder.status)}
                      <Badge className={getStatusBadgeColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Book Details</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedOrder.bookTitle}</p>
                    <p className="text-sm text-gray-600">by {selectedOrder.author}</p>
                    <p className="text-sm text-gray-600">Type: {selectedOrder.orderType}</p>
                    <p className="text-sm text-gray-600">Amount: ${selectedOrder.amount}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Order Timeline</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Order placed on {new Date(selectedOrder.orderDate).toLocaleString()}</span>
                    </div>
                    {selectedOrder.status === 'delivered' && selectedOrder.deliveryDate && (
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Delivered on {new Date(selectedOrder.deliveryDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.deliveryBoy && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Delivery Information</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{selectedOrder.deliveryBoy.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.deliveryBoy.phone}</p>
                      <div className="flex items-center mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm ml-1">{selectedOrder.deliveryBoy.rating}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.trackingId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tracking ID</Label>
                    <p className="text-lg font-mono">{selectedOrder.trackingId}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserEnhancedDashboard;

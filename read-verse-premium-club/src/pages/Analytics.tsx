import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  FireIcon,
  TrophyIcon,
  TargetIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BookmarkIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  TruckIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  Bars3Icon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface ReadingStats {
  totalBooksRead: number;
  totalReadingTime: number;
  averageReadingSpeed: number;
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: MonthlyProgress[];
  genreStats: GenreStat[];
  readingGoals: ReadingGoal[];
}

interface MonthlyProgress {
  month: string;
  booksRead: number;
  pagesRead: number;
  readingTime: number;
}

interface GenreStat {
  genre: string;
  booksRead: number;
  percentage: number;
  color: string;
}

interface ReadingGoal {
  _id: string;
  title: string;
  target: number;
  current: number;
  type: 'books' | 'pages' | 'time';
  deadline: string;
  status: 'on-track' | 'behind' | 'completed';
}

interface SpendingStats {
  totalSpent: number;
  averageOrderValue: number;
  totalOrders: number;
  monthlySpending: MonthlySpending[];
  categorySpending: CategorySpending[];
  topPurchases: TopPurchase[];
}

interface MonthlySpending {
  month: string;
  amount: number;
  orders: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  books: number;
}

interface TopPurchase {
  _id: string;
  title: string;
  author: string;
  price: number;
  purchaseDate: string;
  rating?: number;
}

interface UserInsights {
  readingHabits: ReadingHabit[];
  preferences: Preference[];
  achievements: Achievement[];
  recommendations: Recommendation[];
}

interface ReadingHabit {
  dayOfWeek: string;
  averageTime: number;
  sessions: number;
}

interface Preference {
  category: string;
  preference: number;
  trend: 'up' | 'down' | 'stable';
}

interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  progress?: number;
  total?: number;
}

interface Recommendation {
  _id: string;
  title: string;
  author: string;
  reason: string;
  confidence: number;
  coverImage?: string;
}

const Analytics: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [spendingStats, setSpendingStats] = useState<SpendingStats | null>(null);
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reading');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [readingRes, spendingRes, insightsRes] = await Promise.all([
        authFetch(`/analytics/reading?range=${timeRange}`),
        authFetch(`/analytics/spending?range=${timeRange}`),
        authFetch(`/analytics/insights?range=${timeRange}`)
      ]);

      if (readingRes.ok) {
        const data = await readingRes.json();
        setReadingStats(data);
      }

      if (spendingRes.ok) {
        const data = await spendingRes.json();
        setSpendingStats(data);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setUserInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'on-track': 'text-green-600',
      'behind': 'text-yellow-600',
      'completed': 'text-blue-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      up: ArrowTrendingUpIcon,
      down: ArrowTrendingDownIcon,
      stable: MinusIcon
    };
    const Icon = icons[trend as keyof typeof icons];
    return <Icon className="w-4 h-4" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access analytics.</p>
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
              <h1 className="text-xl font-bold text-gray-900">Analytics & Insights</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Books Read</p>
                  <p className="text-2xl font-bold">{readingStats?.totalBooksRead || 0}</p>
                </div>
                <BookOpenIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Reading Time</p>
                  <p className="text-2xl font-bold">
                    {readingStats ? formatReadingTime(readingStats.totalReadingTime) : '0m'}
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {spendingStats ? formatCurrency(spendingStats.totalSpent) : '₹0'}
                  </p>
                </div>
                <CurrencyDollarIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold">{readingStats?.currentStreak || 0} days</p>
                </div>
                <FireIcon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reading">Reading Analytics</TabsTrigger>
            <TabsTrigger value="spending">Spending Analytics</TabsTrigger>
            <TabsTrigger value="insights">User Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="reading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reading Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TargetIcon className="w-5 h-5" />
                    <span>Reading Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readingStats?.readingGoals.map((goal) => (
                      <div key={goal._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{goal.title}</h3>
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>{goal.current} / {goal.target} {goal.type}</span>
                          <span>{getProgressPercentage(goal.current, goal.target).toFixed(1)}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${getProgressPercentage(goal.current, goal.target)}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Genre Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChartPieIcon className="w-5 h-5" />
                    <span>Genre Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {readingStats?.genreStats.map((genre) => (
                      <div key={genre.genre} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: genre.color }}
                          ></div>
                          <span className="font-medium">{genre.genre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{genre.booksRead} books</span>
                          <span className="text-sm font-medium">{genre.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Monthly Reading Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readingStats?.monthlyProgress.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{month.month}</p>
                          <p className="text-sm text-gray-600">
                            {month.booksRead} books • {month.pagesRead} pages
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatReadingTime(month.readingTime)}</p>
                        <p className="text-sm text-gray-600">reading time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>Spending Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {spendingStats ? formatCurrency(spendingStats.averageOrderValue) : '₹0'}
                      </p>
                      <p className="text-sm text-gray-600">Avg. Order Value</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {spendingStats?.totalOrders || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Spending */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bars3Icon className="w-5 h-5" />
                    <span>Category Spending</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {spendingStats?.categorySpending.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {category.books} books
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(category.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Purchases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5" />
                  <span>Top Purchases</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingStats?.topPurchases.map((purchase) => (
                    <div key={purchase._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BookOpenIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{purchase.title}</p>
                          <p className="text-sm text-gray-600">by {purchase.author}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(purchase.price)}</p>
                        {purchase.rating && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{purchase.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reading Habits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LightBulbIcon className="w-5 h-5" />
                    <span>Reading Habits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userInsights?.readingHabits.map((habit) => (
                      <div key={habit.dayOfWeek} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">{habit.dayOfWeek}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatReadingTime(habit.averageTime)}</p>
                          <p className="text-sm text-gray-600">{habit.sessions} sessions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AcademicCapIcon className="w-5 h-5" />
                    <span>Genre Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userInsights?.preferences.map((pref) => (
                      <div key={pref.category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <BookmarkIcon className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">{pref.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{pref.preference}%</span>
                          {getTrendIcon(pref.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userInsights?.achievements.map((achievement) => (
                    <div key={achievement._id} className="border rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrophyIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h3 className="font-medium mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {achievement.progress !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(achievement.progress / (achievement.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpenIcon className="w-5 h-5" />
                  <span>Recommended for You</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userInsights?.recommendations.map((rec) => (
                    <div key={rec._id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BookOpenIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{rec.title}</h3>
                          <p className="text-sm text-gray-600">by {rec.author}</p>
                          <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${rec.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{rec.confidence}% match</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics; 
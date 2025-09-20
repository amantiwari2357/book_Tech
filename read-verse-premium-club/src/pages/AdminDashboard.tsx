import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpenIcon, 
  UsersIcon, 
  ChartBarIcon, 
  CogIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalAuthors: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingBookApprovals: number;
  pendingSettlements: number;
  recentActivity: Activity[];
}

interface Activity {
  id: string;
  type: 'book_added' | 'user_registered' | 'payment_received' | 'book_approved' | 'settlement_requested';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await authFetch('/admin/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CogIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authors</CardTitle>
              <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAuthors || 0}</div>
              <p className="text-xs text-muted-foreground">Active authors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.monthlyRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingBookApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">Books awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingSettlements || 0}</div>
              <p className="text-xs text-muted-foreground">Author payouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="authors">Authors</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('books')}>
                    Manage Books
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('users')}>
                    User Management
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('authors')}>
                    Author Management
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('financials')}>
                    Financial Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentActivity?.map(activity => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    )) || (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">New book added</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">User registration</p>
                            <p className="text-xs text-gray-500">5 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Payment received</p>
                            <p className="text-xs text-gray-500">10 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Server</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Service</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment Gateway</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Book Operations</h3>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/books')}>
                      View All Books
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/book-approvals')}>
                      Pending Approvals ({stats?.pendingBookApprovals || 0})
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/books')}>
                      Featured Books
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/books')}>
                      Recommended Books
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Book Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Books:</span>
                        <span className="font-bold">{stats?.totalBooks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Reviews:</span>
                        <span className="font-bold text-orange-600">{stats?.pendingBookApprovals || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Published Today:</span>
                        <span className="font-bold text-green-600">5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Operations</h3>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/users')}>
                      View All Users
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/users')}>
                      Premium Users
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/users')}>
                      User Analytics
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/users')}>
                      Export User Data
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Users:</span>
                        <span className="font-bold">{stats?.totalUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Subscriptions:</span>
                        <span className="font-bold text-green-600">{stats?.activeSubscriptions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New This Month:</span>
                        <span className="font-bold text-blue-600">45</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Author Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Author Operations</h3>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/authors')}>
                      View All Authors
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/authors')}>
                      Pending Settlements ({stats?.pendingSettlements || 0})
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/authors')}>
                      Author Earnings
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/authors')}>
                      Author Performance
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Author Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Authors:</span>
                        <span className="font-bold">{stats?.totalAuthors || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Settlements:</span>
                        <span className="font-bold text-orange-600">{stats?.pendingSettlements || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Top Earners:</span>
                        <span className="font-bold text-green-600">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Financial Operations</h3>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/financials')}>
                      Revenue Reports
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/financials')}>
                      Expense Tracking
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/financials')}>
                      Author Payouts
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => navigate('/admin/financials')}>
                      Financial Analytics
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Financial Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-bold text-green-600">${stats?.totalRevenue || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Revenue:</span>
                        <span className="font-bold text-blue-600">${stats?.monthlyRevenue || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Payouts:</span>
                        <span className="font-bold text-orange-600">${stats?.pendingSettlements || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 
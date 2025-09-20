import React, { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayouts: number;
  completedPayouts: number;
  authorEarnings: number;
  platformCommission: number;
}

interface Transaction {
  _id: string;
  type: 'revenue' | 'expense' | 'payout' | 'commission';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  authorName?: string;
  bookTitle?: string;
}

interface Payout {
  _id: string;
  authorId: string;
  authorName: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  paymentMethod: string;
  transactionId?: string;
}

const AdminFinancialManagement: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange]);

  const fetchFinancialData = async () => {
    try {
      const [statsRes, transactionsRes, payoutsRes] = await Promise.all([
        authFetch(`/admin/financials/stats?range=${timeRange}`),
        authFetch(`/admin/financials/transactions?range=${timeRange}`),
        authFetch('/admin/financials/payouts')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }

      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'reject') => {
    try {
      const res = await authFetch(`/admin/financials/payouts/${payoutId}/${action}`, {
        method: 'POST',
      });
      if (res.ok) {
        setPayouts(payouts => 
          payouts.map(payout => 
            payout._id === payoutId 
              ? { 
                  ...payout, 
                  status: action === 'approve' ? 'completed' : 'rejected',
                  processedAt: action === 'approve' ? new Date().toISOString() : undefined
                }
              : payout
          )
        );
        // Refresh stats after payout action
        fetchFinancialData();
      }
    } catch (error) {
      console.error(`Error ${action}ing payout:`, error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': 
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'expense': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      case 'payout': return <CurrencyDollarIcon className="h-4 w-4 text-blue-500" />;
      case 'commission': return <ChartBarIcon className="h-4 w-4 text-purple-500" />;
      default: return <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Financial Management</h1>
        <p className="text-gray-600 mb-6">Monitor revenue, expenses, and manage author payouts.</p>
        
        {/* Time Range Selector */}
        <div className="mb-6">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Financial Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">${stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-purple-600">${stats.netProfit.toLocaleString()}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                    <p className="text-2xl font-bold text-orange-600">${stats.pendingPayouts.toLocaleString()}</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Breakdown */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Platform Commission</span>
                    <span className="font-bold text-green-600">${stats.platformCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Author Earnings</span>
                    <span className="font-bold text-blue-600">${stats.authorEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Expenses</span>
                    <span className="font-bold text-red-600">${stats.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payout Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed Payouts</span>
                    <span className="font-bold text-green-600">${stats.completedPayouts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending Payouts</span>
                    <span className="font-bold text-orange-600">${stats.pendingPayouts.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Description</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.authorName && (
                              <p className="text-sm text-gray-500">Author: {transaction.authorName}</p>
                            )}
                            {transaction.bookTitle && (
                              <p className="text-sm text-gray-500">Book: {transaction.bookTitle}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className={`font-medium ${
                            transaction.type === 'revenue' ? 'text-green-600' : 
                            transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            ${transaction.amount.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusBadgeColor(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          {/* Payouts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Author Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Author</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Payment Method</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Requested</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map(payout => (
                      <tr key={payout._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-medium">{payout.authorName}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-green-600">${payout.amount.toLocaleString()}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{payout.paymentMethod}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusBadgeColor(payout.status)}>
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{new Date(payout.requestedAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          {payout.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePayoutAction(payout._id, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePayoutAction(payout._id, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {payout.status === 'completed' && payout.transactionId && (
                            <p className="text-xs text-gray-500">ID: {payout.transactionId}</p>
                          )}
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
    </div>
  );
};

export default AdminFinancialManagement;

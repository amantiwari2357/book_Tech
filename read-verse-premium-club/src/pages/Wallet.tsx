import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  WalletIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  GiftIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  QrCodeIcon,
  LinkIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface WalletBalance {
  balance: number;
  points: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
}

interface Transaction {
  _id: string;
  type: 'credit' | 'debit' | 'referral' | 'settlement' | 'purchase';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  referenceId?: string;
  metadata?: any;
}

interface ReferralCode {
  _id: string;
  code: string;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
  rewardAmount: number;
  createdAt: string;
  expiresAt?: string;
}

interface SettlementRequest {
  _id: string;
  amount: number;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

const Wallet: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [settlementRequests, setSettlementRequests] = useState<SettlementRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchWalletBalance(),
        fetchTransactions(),
        fetchReferralCodes(),
        fetchSettlementRequests()
      ]);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await authFetch('/users/wallet');
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await authFetch('/users/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchReferralCodes = async () => {
    try {
      const res = await authFetch('/users/referral-codes');
      if (res.ok) {
        const data = await res.json();
        setReferralCodes(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral codes:', error);
    }
  };

  const fetchSettlementRequests = async () => {
    try {
      const res = await authFetch('/users/settlement-requests');
      if (res.ok) {
        const data = await res.json();
        setSettlementRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch settlement requests:', error);
    }
  };

  const generateReferralCode = async () => {
    try {
      const res = await authFetch('/users/referral-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rewardAmount: 100, // ₹100 reward for each referral
          maxUsage: 10
        })
      });

      if (res.ok) {
        fetchReferralCodes();
        setShowReferralModal(true);
      }
    } catch (error) {
      console.error('Failed to generate referral code:', error);
    }
  };

  const copyReferralCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const shareReferralCode = async (code: ReferralCode) => {
    try {
      const shareUrl = `${window.location.origin}/signup?ref=${code.code}`;
      await navigator.clipboard.writeText(shareUrl);
      // Show success message
    } catch (error) {
      console.error('Failed to share referral code:', error);
    }
  };

  const requestSettlement = async () => {
    if (!settlementAmount || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
      return;
    }

    try {
      const res = await authFetch('/users/settlement-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(settlementAmount),
          bankDetails
        })
      });

      if (res.ok) {
        setShowSettlementModal(false);
        setSettlementAmount('');
        setBankDetails({
          accountNumber: '',
          ifscCode: '',
          accountHolderName: ''
        });
        fetchSettlementRequests();
        fetchWalletBalance();
      }
    } catch (error) {
      console.error('Failed to request settlement:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    const iconMap = {
      credit: ArrowDownTrayIcon,
      debit: ArrowUpTrayIcon,
      referral: GiftIcon,
      settlement: BanknotesIcon,
      purchase: CreditCardIcon
    };
    
    const Icon = iconMap[type as keyof typeof iconMap] || WalletIcon;
    return <Icon className="w-4 h-4" />;
  };

  const getTransactionColor = (type: string) => {
    const colorMap = {
      credit: 'text-green-600',
      debit: 'text-red-600',
      referral: 'text-blue-600',
      settlement: 'text-purple-600',
      purchase: 'text-orange-600'
    };
    
    return colorMap[type as keyof typeof colorMap] || 'text-gray-600';
  };

  const getSettlementStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      processing: { color: 'bg-blue-100 text-blue-800', icon: CogIcon },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XMarkIcon }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your wallet.</p>
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
              <h1 className="text-xl font-bold text-gray-900">Wallet & Referrals</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setShowSettlementModal(true)}>
                <BanknotesIcon className="w-4 h-4 mr-2" />
                Request Settlement
              </Button>
              <Button onClick={generateReferralCode}>
                <GiftIcon className="w-4 h-4 mr-2" />
                Generate Referral Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold">₹{walletBalance?.balance || 0}</p>
                </div>
                <WalletIcon className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Loyalty Points</p>
                  <p className="text-2xl font-bold">{walletBalance?.points || 0}</p>
                </div>
                <StarIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold">₹{walletBalance?.totalEarned || 0}</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending Balance</p>
                  <p className="text-2xl font-bold">₹{walletBalance?.pendingBalance || 0}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full justify-start" onClick={() => setShowSettlementModal(true)}>
                      <BanknotesIcon className="w-4 h-4 mr-2" />
                      Request Settlement
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={generateReferralCode}>
                      <GiftIcon className="w-4 h-4 mr-2" />
                      Generate Referral Code
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Download Statement
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CogIcon className="w-4 h-4 mr-2" />
                      Wallet Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent transactions</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getTransactionColor(transaction.type).replace('text-', 'bg-').replace('-600', '-100')}`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </p>
                          {transaction.referenceId && (
                            <p className="text-xs text-gray-400">Ref: {transaction.referenceId}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-12">
                      <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                      <p className="text-gray-500">Your transaction history will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referralCodes.map((code) => (
                    <div key={code._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-lg">{code.code}</h3>
                          <p className="text-sm text-gray-500">
                            Reward: ₹{code.rewardAmount} per referral
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={code.isActive ? 'default' : 'secondary'}>
                            {code.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {code.usageCount}/{code.maxUsage} used
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Created: {new Date(code.createdAt).toLocaleDateString()}</p>
                          {code.expiresAt && (
                            <p>Expires: {new Date(code.expiresAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyReferralCode(code.code)}
                          >
                            {copiedCode === code.code ? (
                              <CheckIcon className="w-4 h-4 mr-2" />
                            ) : (
                              <CopyIcon className="w-4 h-4 mr-2" />
                            )}
                            {copiedCode === code.code ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareReferralCode(code)}
                          >
                            <ShareIcon className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {referralCodes.length === 0 && (
                    <div className="text-center py-12">
                      <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No referral codes</h3>
                      <p className="text-gray-500 mb-4">Generate a referral code to start earning rewards.</p>
                      <Button onClick={generateReferralCode}>
                        Generate Referral Code
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settlements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settlement Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settlementRequests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-lg">₹{request.amount}</h3>
                          <p className="text-sm text-gray-500">
                            Requested on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {getSettlementStatusBadge(request.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Account Holder:</span>
                          <span>{request.bankDetails.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account Number:</span>
                          <span>****{request.bankDetails.accountNumber.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IFSC Code:</span>
                          <span>{request.bankDetails.ifscCode}</span>
                        </div>
                        {request.processedAt && (
                          <div className="flex justify-between">
                            <span>Processed:</span>
                            <span>{new Date(request.processedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {request.rejectionReason && (
                          <div className="text-red-600">
                            <span className="font-medium">Rejection Reason:</span> {request.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {settlementRequests.length === 0 && (
                    <div className="text-center py-12">
                      <BanknotesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No settlement requests</h3>
                      <p className="text-gray-500 mb-4">Request a settlement to withdraw your earnings.</p>
                      <Button onClick={() => setShowSettlementModal(true)}>
                        Request Settlement
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Settlement Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Settlement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <Input
                  type="number"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={walletBalance?.balance || 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ₹{walletBalance?.balance || 0}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                <Input
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  placeholder="Enter account holder name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <Input
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  placeholder="Enter account number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">IFSC Code</label>
                <Input
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSettlementModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={requestSettlement}
                disabled={!settlementAmount || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName}
              >
                Request Settlement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Code Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Referral Code Generated!</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Share this code with friends to earn rewards</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {referralCodes[referralCodes.length - 1]?.code}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• Each successful referral earns you ₹100</p>
                <p>• Your friend gets ₹50 on signup</p>
                <p>• Maximum 10 referrals per code</p>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowReferralModal(false)}
              >
                Close
              </Button>
              <Button onClick={() => {
                const code = referralCodes[referralCodes.length - 1]?.code;
                if (code) {
                  copyReferralCode(code);
                }
              }}>
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet; 
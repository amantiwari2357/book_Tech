import React, { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Author {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  totalBooks: number;
  totalEarnings: number;
  pendingEarnings: number;
  lastSettlement: string;
  books: Book[];
}

interface Book {
  _id: string;
  title: string;
  price: number;
  sales: number;
  earnings: number;
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
}

interface Settlement {
  _id: string;
  authorId: string;
  authorName: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  completedAt?: string;
}

const AdminAuthorManagement: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorDetailsOpen, setAuthorDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('authors');

  useEffect(() => {
    fetchAuthors();
    fetchSettlements();
  }, []);

  const fetchAuthors = async () => {
    try {
      const res = await authFetch('/admin/authors');
      if (res.ok) {
        const data = await res.json();
        setAuthors(data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      const res = await authFetch('/admin/settlements');
      if (res.ok) {
        const data = await res.json();
        setSettlements(data);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  };

  const handleToggleAuthorStatus = async (authorId: string, currentStatus: boolean) => {
    try {
      const res = await authFetch(`/admin/authors/${authorId}/toggle-status`, {
        method: 'POST',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setAuthors(authors => 
          authors.map(author => 
            author._id === authorId 
              ? { ...author, isActive: !currentStatus }
              : author
          )
        );
      }
    } catch (error) {
      console.error('Error toggling author status:', error);
    }
  };

  const handleSettlementAction = async (settlementId: string, action: 'approve' | 'reject') => {
    try {
      const res = await authFetch(`/admin/settlements/${settlementId}/${action}`, {
        method: 'POST',
      });
      if (res.ok) {
        setSettlements(settlements => 
          settlements.map(settlement => 
            settlement._id === settlementId 
              ? { 
                  ...settlement, 
                  status: action === 'approve' ? 'completed' : 'rejected',
                  completedAt: action === 'approve' ? new Date().toISOString() : undefined
                }
              : settlement
          )
        );
      }
    } catch (error) {
      console.error(`Error ${action}ing settlement:`, error);
    }
  };

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(search.toLowerCase()) ||
    author.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold mb-4">Author Management</h1>
        <p className="text-gray-600 mb-6">Manage authors, their earnings, and settlement processes.</p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Authors</p>
                  <p className="text-2xl font-bold">{authors.length}</p>
                </div>
                <UserIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Books</p>
                  <p className="text-2xl font-bold">{authors.reduce((sum, author) => sum + author.totalBooks, 0)}</p>
                </div>
                <BookOpenIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold">${authors.reduce((sum, author) => sum + author.totalEarnings, 0)}</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Settlements</p>
                  <p className="text-2xl font-bold">{settlements.filter(s => s.status === 'pending').length}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="authors">
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search authors by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Authors Table */}
          <Card>
            <CardHeader>
              <CardTitle>Authors List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Author</th>
                      <th className="text-left p-4">Books</th>
                      <th className="text-left p-4">Total Earnings</th>
                      <th className="text-left p-4">Pending</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuthors.map(author => (
                      <tr key={author._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{author.name}</p>
                            <p className="text-sm text-gray-500">{author.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{author.totalBooks}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-green-600">${author.totalEarnings}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-orange-600">${author.pendingEarnings}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant={author.isActive ? "default" : "secondary"}>
                            {author.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAuthor(author);
                                setAuthorDetailsOpen(true);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAuthorStatus(author._id, author.isActive)}
                            >
                              {author.isActive ? "Deactivate" : "Activate"}
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

        <TabsContent value="settlements">
          {/* Settlements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Settlement Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Author</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Requested</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map(settlement => (
                      <tr key={settlement._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-medium">{settlement.authorName}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-green-600">${settlement.amount}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusBadgeColor(settlement.status)}>
                            {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{new Date(settlement.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          {settlement.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSettlementAction(settlement._id, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSettlementAction(settlement._id, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Author Details Modal */}
      <Dialog open={authorDetailsOpen} onOpenChange={setAuthorDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Author Details</DialogTitle>
          </DialogHeader>
          {selectedAuthor && (
            <div className="space-y-6">
              {/* Author Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{selectedAuthor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{selectedAuthor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge variant={selectedAuthor.isActive ? "default" : "secondary"}>
                    {selectedAuthor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Joined Date</label>
                  <p className="text-lg">{new Date(selectedAuthor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Earnings Summary */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">${selectedAuthor.totalEarnings}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                    <p className="text-2xl font-bold text-orange-600">${selectedAuthor.pendingEarnings}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Books</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedAuthor.totalBooks}</p>
                  </div>
                </div>
              </div>

              {/* Books List */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Books</h3>
                <div className="space-y-2">
                  {selectedAuthor.books.map(book => (
                    <div key={book._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-gray-500">Sales: {book.sales} | Earnings: ${book.earnings}</p>
                      </div>
                      <Badge className={getStatusBadgeColor(book.status)}>
                        {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuthorManagement;

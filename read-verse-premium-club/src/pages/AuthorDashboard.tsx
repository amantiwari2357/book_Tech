import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpenIcon, PencilIcon, ChartBarIcon, ArrowUpTrayIcon, 
  PlusIcon, EyeIcon, ClockIcon, CheckCircleIcon, XCircleIcon, BellIcon,
  UsersIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, CalendarIcon,
  StarIcon, HeartIcon, ShoppingCartIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Book {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  coverImage?: string;
  isApproved: boolean;
  createdAt: string;
  sales: number;
  earnings: number;
  rating: number;
  totalReviews: number;
}

interface BookDesign {
  _id: string;
  title: string;
  description: string;
  coverDesign: string;
  contentDesign: string;
  isApproved: boolean;
  createdAt: string;
}

interface Analytics {
  totalBooks: number;
  approvedBooks: number;
  pendingBooks: number;
  totalSales: number;
  totalEarnings: number;
  totalViews: number;
  totalReviews: number;
  averageRating: number;
  monthlySales: Array<{ month: string; sales: number; earnings: number }>;
  topBooks: Array<{ title: string; sales: number; earnings: number }>;
}

const AuthorDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [bookDesigns, setBookDesigns] = useState<BookDesign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Book upload form state
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    coverImage: '',
    content: ''
  });

  // Book design form state
  const [designForm, setDesignForm] = useState({
    title: '',
    description: '',
    coverDesign: '',
    contentDesign: '',
    fontFamily: 'Arial',
    fontSize: '16px',
    colorScheme: 'default'
  });

  useEffect(() => {
    if (user?.role === 'author') {
      fetchBooks();
      fetchBookDesigns();
      fetchAnalytics();
      fetchNotifications();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const response = await authFetch('/books/my-books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const fetchBookDesigns = async () => {
    try {
      const response = await authFetch('/book-designs/my-designs');
      if (response.ok) {
        const data = await response.json();
        setBookDesigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch book designs:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await authFetch('/authors/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await authFetch('/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleBookUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
    const bookData = {
        ...bookForm,
        authorRef: user?.id,
        isApproved: false
      };
      
      const res = await authFetch('/books', { 
          method: 'POST',
        body: JSON.stringify(bookData) 
        });

      if (res.ok) {
        setBookForm({
          title: '',
          description: '',
          price: 0,
          category: '',
          coverImage: '',
          content: ''
        });
        setShowUploadModal(false);
        fetchBooks();
        
        // Send notification to admin
        await authFetch('/notifications/admin', {
          method: 'POST',
          body: JSON.stringify({
            type: 'book_upload',
            message: `New book "${bookForm.title}" uploaded by ${user?.name}`,
            bookId: (await res.json())._id
          })
        });
      }
    } catch (error) {
      console.error('Failed to upload book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookDesignCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch('/book-designs', { 
        method: 'POST', 
        body: JSON.stringify(designForm) 
      });
      
      if (res.ok) {
        setDesignForm({
          title: '',
          description: '',
          coverDesign: '',
          contentDesign: '',
          fontFamily: 'Arial',
          fontSize: '16px',
          colorScheme: 'default'
        });
        setShowDesignModal(false);
        fetchBookDesigns();
        
        // Send notification to admin
        await authFetch('/notifications/admin', {
          method: 'POST',
          body: JSON.stringify({
            type: 'book_design',
            message: `New book design "${designForm.title}" created by ${user?.name}`,
            designId: (await res.json())._id
          })
        });
      }
    } catch (error) {
      console.error('Failed to create book design:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || user.role !== 'author') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only authors can access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Author Dashboard</h1>
          <p className="text-gray-600">Manage your books, track performance, and create new content</p>
      </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Books</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalBooks}</p>
                  </div>
                  <BookOpenIcon className="w-8 h-8 text-blue-500" />
          </div>
              </CardContent>
        </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.totalSales}</p>
                  </div>
                  <ShoppingCartIcon className="w-8 h-8 text-green-500" />
          </div>
              </CardContent>
        </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPrice(analytics.totalEarnings)}</p>
          </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-purple-500" />
      </div>
              </CardContent>
        </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.averageRating.toFixed(1)}</p>
                  </div>
                  <StarIcon className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
          </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">My Books</TabsTrigger>
            <TabsTrigger value="designs">Book Designs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Books */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5" />
                    Recent Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.slice(0, 5).map((book) => (
                      <div key={book._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{book.title}</h4>
                          <p className="text-sm text-gray-500">{book.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={book.isApproved ? 'default' : 'secondary'}>
                              {book.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                            <span className="text-sm text-gray-500">{formatPrice(book.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setShowUploadModal(true)} className="w-full">
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                    Upload New Book
                  </Button>
                  <Button onClick={() => setShowDesignModal(true)} variant="outline" className="w-full">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Create Book Design
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
          </Card>
      </div>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Books</CardTitle>
                  <Button onClick={() => setShowUploadModal(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add New Book
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-10 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpenIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{book.title}</div>
                              <div className="text-sm text-gray-500">{formatDate(book.createdAt)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>{formatPrice(book.price)}</TableCell>
                        <TableCell>
                          <Badge variant={book.isApproved ? 'default' : 'secondary'}>
                            {book.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{book.sales}</TableCell>
                        <TableCell>{formatPrice(book.earnings)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                            {book.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Analytics Overview</h2>
              <Button onClick={() => navigate('/author-analytics')} className="flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4" />
                View Detailed Analytics
              </Button>
            </div>
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Sales Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.monthlySales.map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="font-medium">{month.month}</span>
                          <div className="text-right">
                            <div className="font-semibold">{month.sales} sales</div>
                            <div className="text-sm text-gray-500">{formatPrice(month.earnings)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performing Books */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Books</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topBooks.map((book, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg">{index + 1}</span>
                            <div>
                              <div className="font-medium">{book.title}</div>
                              <div className="text-sm text-gray-500">{book.sales} sales</div>
                            </div>
                          </div>
                          <div className="text-right font-semibold">
                            {formatPrice(book.earnings)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
        </div>
      )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <BellIcon className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500">{formatDate(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Book Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Upload New Book</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                    <XCircleIcon className="w-6 h-6" />
                  </Button>
            </div>

                <form onSubmit={handleBookUpload} className="space-y-4">
            <div>
                    <Label htmlFor="title">Book Title</Label>
                    <Input
                      id="title"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                      required
                    />
            </div>

            <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={bookForm.description}
                      onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                      required
                    />
            </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={bookForm.price}
                        onChange={(e) => setBookForm({...bookForm, price: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={bookForm.category} onValueChange={(value) => setBookForm({...bookForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fiction">Fiction</SelectItem>
                          <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                          <SelectItem value="mystery">Mystery</SelectItem>
                          <SelectItem value="romance">Romance</SelectItem>
                          <SelectItem value="sci-fi">Science Fiction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
            </div>

            <div>
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input
                      id="coverImage"
                      value={bookForm.coverImage}
                      onChange={(e) => setBookForm({...bookForm, coverImage: e.target.value})}
                    />
            </div>

            <div>
                    <Label htmlFor="content">Book Content</Label>
                    <Textarea
                      id="content"
                      value={bookForm.content}
                      onChange={(e) => setBookForm({...bookForm, content: e.target.value})}
                      rows={6}
                      required
                    />
            </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Uploading...' : 'Upload Book'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Book Design Modal */}
        {showDesignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Create Book Design</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowDesignModal(false)}>
                    <XCircleIcon className="w-6 h-6" />
                  </Button>
            </div>

                <form onSubmit={handleBookDesignCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="designTitle">Design Title</Label>
                    <Input
                      id="designTitle"
                      value={designForm.title}
                      onChange={(e) => setDesignForm({...designForm, title: e.target.value})}
                    required
                  />
                  </div>
                  
                  <div>
                    <Label htmlFor="designDescription">Description</Label>
                    <Textarea
                      id="designDescription"
                      value={designForm.description}
                      onChange={(e) => setDesignForm({...designForm, description: e.target.value})}
                    required
                  />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <Select value={designForm.fontFamily} onValueChange={(value) => setDesignForm({...designForm, fontFamily: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Verdana">Verdana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Select value={designForm.fontSize} onValueChange={(value) => setDesignForm({...designForm, fontSize: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="14px">14px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="18px">18px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="colorScheme">Color Scheme</Label>
                      <Select value={designForm.colorScheme} onValueChange={(value) => setDesignForm({...designForm, colorScheme: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="sepia">Sepia</SelectItem>
                          <SelectItem value="high-contrast">High Contrast</SelectItem>
                        </SelectContent>
                      </Select>
              </div>
            </div>

                  <div>
                    <Label htmlFor="coverDesign">Cover Design Description</Label>
                    <Textarea
                      id="coverDesign"
                      value={designForm.coverDesign}
                      onChange={(e) => setDesignForm({...designForm, coverDesign: e.target.value})}
                      rows={3}
                      required
                    />
            </div>

                  <div>
                    <Label htmlFor="contentDesign">Content Design Description</Label>
                    <Textarea
                      id="contentDesign"
                      value={designForm.contentDesign}
                      onChange={(e) => setDesignForm({...designForm, contentDesign: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowDesignModal(false)}>
                  Cancel
                </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Design'}
                    </Button>
            </div>
          </form>
                      </div>
                        </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;
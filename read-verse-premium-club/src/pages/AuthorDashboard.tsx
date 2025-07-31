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
import { 
  BookOpenIcon, 
  PencilIcon, 
  ChartBarIcon, 
  ArrowUpTrayIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  category: string;
  genre: string;
  tags: string[];
  isPremium: boolean;
  readingType: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface BookDesign {
  _id: string;
  title: string;
  author: string;
  coverDesign: {
    backgroundColor: string;
    titleFont: string;
    titleColor: string;
    subtitleFont: string;
    subtitleColor: string;
    coverImage?: string;
  };
  contentDesign: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    textColor: string;
    backgroundColor: string;
    chapterHeadingFont: string;
    chapterHeadingColor: string;
  };
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AuthorDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookDesigns, setBookDesigns] = useState<BookDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Book upload form state
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    genre: '',
    tags: '',
    isPremium: false,
    readingType: 'soft',
    coverImage: ''
  });

  // Book design form state
  const [designForm, setDesignForm] = useState({
    title: '',
    author: user?.name || '',
    coverDesign: {
      backgroundColor: '#ffffff',
      titleFont: 'Arial',
      titleColor: '#000000',
      subtitleFont: 'Arial',
      subtitleColor: '#666666',
      coverImage: ''
    },
    contentDesign: {
      fontFamily: 'Arial',
      fontSize: 16,
      lineHeight: 1.5,
      textColor: '#000000',
      backgroundColor: '#ffffff',
      chapterHeadingFont: 'Arial',
      chapterHeadingColor: '#000000'
    }
  });

  useEffect(() => {
    if (user?.role === 'author') {
      fetchBooks();
      fetchBookDesigns();
      fetchNotifications();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const res = await authFetch('/books/my-books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const fetchBookDesigns = async () => {
    try {
      const res = await authFetch('/book-designs/my-designs');
      if (res.ok) {
        const data = await res.json();
        setBookDesigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch book designs:', error);
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

  const handleBookUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const bookData = {
        ...bookForm,
        price: parseFloat(bookForm.price),
        tags: bookForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      const res = await authFetch('/books', {
        method: 'POST',
        body: JSON.stringify(bookData)
      });

      if (res.ok) {
        setShowUploadModal(false);
        setBookForm({
          title: '',
          description: '',
          price: '',
          category: '',
          genre: '',
          tags: '',
          isPremium: false,
          readingType: 'soft',
          coverImage: ''
        });
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
        setShowDesignModal(false);
        setDesignForm({
          title: '',
          author: user?.name || '',
          coverDesign: {
            backgroundColor: '#ffffff',
            titleFont: 'Arial',
            titleColor: '#000000',
            subtitleFont: 'Arial',
            subtitleColor: '#666666',
            coverImage: ''
          },
          contentDesign: {
            fontFamily: 'Arial',
            fontSize: 16,
            lineHeight: 1.5,
            textColor: '#000000',
            backgroundColor: '#ffffff',
            chapterHeadingFont: 'Arial',
            chapterHeadingColor: '#000000'
          }
        });
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: ClockIcon },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowUploadModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload Book
              </Button>
              <Button onClick={() => setShowDesignModal(true)} variant="outline">
                <PencilIcon className="w-4 h-4 mr-2" />
                Create Design
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Books</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{books.filter(b => b.status === 'approved').length}</div>
              <p className="text-xs text-muted-foreground">Total published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{books.filter(b => b.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Book Designs</CardTitle>
              <PencilIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookDesigns.length}</div>
              <p className="text-xs text-muted-foreground">Total designs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <BellIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">My Books</TabsTrigger>
            <TabsTrigger value="designs">Book Designs</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.slice(0, 3).map((book) => (
                      <div key={book._id} className="flex items-center space-x-4">
                        <div className="w-12 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <h3 className="font-medium">{book.title}</h3>
                          <p className="text-sm text-gray-500">{book.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(book.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {books.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No books uploaded yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification._id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No notifications</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {books.map((book) => (
                    <div key={book._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-200 rounded"></div>
                        <div>
                          <h3 className="font-medium">{book.title}</h3>
                          <p className="text-sm text-gray-500">{book.category} • {book.genre}</p>
                          <p className="text-sm text-gray-500">₹{book.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(book.status)}
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {books.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No books uploaded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Designs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookDesigns.map((design) => (
                    <div key={design._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-200 rounded"></div>
                        <div>
                          <h3 className="font-medium">{design.title}</h3>
                          <p className="text-sm text-gray-500">Font: {design.contentDesign.fontFamily}</p>
                          <p className="text-sm text-gray-500">Size: {design.contentDesign.fontSize}px</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(design.status)}
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {bookDesigns.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No book designs created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No notifications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Book Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Upload New Book</h2>
              <form onSubmit={handleBookUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={bookForm.price}
                      onChange={(e) => setBookForm({...bookForm, price: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={bookForm.description}
                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={bookForm.category}
                      onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={bookForm.genre}
                      onChange={(e) => setBookForm({...bookForm, genre: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={bookForm.tags}
                    onChange={(e) => setBookForm({...bookForm, tags: e.target.value})}
                    placeholder="fiction, adventure, fantasy"
                  />
                </div>

                <div>
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    value={bookForm.coverImage}
                    onChange={(e) => setBookForm({...bookForm, coverImage: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="readingType">Reading Type</Label>
                    <Select
                      value={bookForm.readingType}
                      onValueChange={(value) => setBookForm({...bookForm, readingType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soft">Soft Copy (Read Online)</SelectItem>
                        <SelectItem value="hard">Hard Copy (Delivery Available)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPremium"
                      checked={bookForm.isPremium}
                      onChange={(e) => setBookForm({...bookForm, isPremium: e.target.checked})}
                    />
                    <Label htmlFor="isPremium">Premium Book</Label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Book'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Book Design Modal */}
        {showDesignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create Book Design</h2>
              <form onSubmit={handleBookDesignCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="designAuthor">Author</Label>
                    <Input
                      id="designAuthor"
                      value={designForm.author}
                      onChange={(e) => setDesignForm({...designForm, author: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cover Design */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cover Design</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="coverBgColor">Background Color</Label>
                        <Input
                          id="coverBgColor"
                          type="color"
                          value={designForm.coverDesign.backgroundColor}
                          onChange={(e) => setDesignForm({
                            ...designForm,
                            coverDesign: {...designForm.coverDesign, backgroundColor: e.target.value}
                          })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="titleFont">Title Font</Label>
                        <Select
                          value={designForm.coverDesign.titleFont}
                          onValueChange={(value) => setDesignForm({
                            ...designForm,
                            coverDesign: {...designForm.coverDesign, titleFont: value}
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="titleColor">Title Color</Label>
                        <Input
                          id="titleColor"
                          type="color"
                          value={designForm.coverDesign.titleColor}
                          onChange={(e) => setDesignForm({
                            ...designForm,
                            coverDesign: {...designForm.coverDesign, titleColor: e.target.value}
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="coverImage">Cover Image URL</Label>
                        <Input
                          id="coverImage"
                          value={designForm.coverDesign.coverImage}
                          onChange={(e) => setDesignForm({
                            ...designForm,
                            coverDesign: {...designForm.coverDesign, coverImage: e.target.value}
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Design */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Design</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="contentFont">Content Font</Label>
                        <Select
                          value={designForm.contentDesign.fontFamily}
                          onValueChange={(value) => setDesignForm({
                            ...designForm,
                            contentDesign: {...designForm.contentDesign, fontFamily: value}
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fontSize">Font Size (px)</Label>
                        <Input
                          id="fontSize"
                          type="number"
                          value={designForm.contentDesign.fontSize}
                          onChange={(e) => setDesignForm({
                            ...designForm,
                            contentDesign: {...designForm.contentDesign, fontSize: parseInt(e.target.value)}
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="lineHeight">Line Height</Label>
                        <Input
                          id="lineHeight"
                          type="number"
                          step="0.1"
                          value={designForm.contentDesign.lineHeight}
                          onChange={(e) => setDesignForm({
                            ...designForm,
                            contentDesign: {...designForm.contentDesign, lineHeight: parseFloat(e.target.value)}
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <Input
                          id="textColor"
                          type="color"
                          value={designForm.contentDesign.textColor}
                          onChange={(e) => setDesignForm({
                            ...designForm,
                            contentDesign: {...designForm.contentDesign, textColor: e.target.value}
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bgColor">Background Color</Label>
                        <Input
                          id="bgColor"
                          type="color"
                          value={designForm.contentDesign.backgroundColor}
                          onChange={(e) => setDesignForm({
                            ...designForm,
                            contentDesign: {...designForm.contentDesign, backgroundColor: e.target.value}
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Design'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowDesignModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;
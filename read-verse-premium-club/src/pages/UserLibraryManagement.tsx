import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpenIcon, 
  HeartIcon, 
  ClockIcon, 
  StarIcon,
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  CalendarIcon,
  ChartBarIcon,
  TrophyIcon,
  SparklesIcon,
  FireIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

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
  totalPages: number;
  currentPage: number;
  isCompleted: boolean;
  completionDate?: string;
}

interface ReadingStats {
  totalBooks: number;
  completedBooks: number;
  inProgressBooks: number;
  totalReadingTime: number;
  averageRating: number;
  favoriteCategory: string;
  readingStreak: number;
  longestStreak: number;
  booksThisMonth: number;
  pagesRead: number;
}

const UserLibraryManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'purchaseDate' | 'lastRead' | 'progress' | 'rating'>('purchaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress' | 'not-started'>('all');

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchLibraryData();
    }
  }, [user]);

  const fetchLibraryData = async () => {
    try {
      const [booksRes, statsRes] = await Promise.all([
        authFetch('/user/library'),
        authFetch('/user/library/stats')
      ]);

      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (bookId: string) => {
    try {
      const res = await authFetch(`/user/wishlist/${bookId}`, {
        method: 'POST',
      });
      if (res.ok) {
        setBooks(books => 
          books.map(book => 
            book._id === bookId 
              ? { ...book, isInWishlist: true }
              : book
          )
        );
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      const res = await authFetch(`/user/wishlist/${bookId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBooks(books => 
          books.map(book => 
            book._id === bookId 
              ? { ...book, isInWishlist: false }
              : book
          )
        );
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
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

  const getStatusBadge = (book: Book) => {
    if (book.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (book.readingProgress > 0) {
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
    }
  };

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                           book.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'completed' && book.isCompleted) ||
                           (statusFilter === 'in-progress' && book.readingProgress > 0 && !book.isCompleted) ||
                           (statusFilter === 'not-started' && book.readingProgress === 0);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'purchaseDate':
          aValue = new Date(a.purchaseDate).getTime();
          bValue = new Date(b.purchaseDate).getTime();
          break;
        case 'lastRead':
          aValue = a.lastRead ? new Date(a.lastRead).getTime() : 0;
          bValue = b.lastRead ? new Date(b.lastRead).getTime() : 0;
          break;
        case 'progress':
          aValue = a.readingProgress;
          bValue = b.readingProgress;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const categories = [...new Set(books.map(book => book.category))];

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            My Library
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal book collection</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Books</p>
                    <p className="text-3xl font-bold">{stats.totalBooks}</p>
                    <p className="text-green-100 text-xs">{stats.completedBooks} completed</p>
                  </div>
                  <BookOpenIcon className="h-12 w-12 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Reading Time</p>
                    <p className="text-3xl font-bold">{Math.floor(stats.totalReadingTime / 60)}h</p>
                    <p className="text-blue-100 text-xs">{stats.readingStreak} day streak</p>
                  </div>
                  <ClockIcon className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Pages Read</p>
                    <p className="text-3xl font-bold">{stats.pagesRead}</p>
                    <p className="text-purple-100 text-xs">{stats.booksThisMonth} this month</p>
                  </div>
                  <ChartBarIcon className="h-12 w-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Avg Rating</p>
                    <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-orange-100 text-xs">Favorite: {stats.favoriteCategory}</p>
                  </div>
                  <TrophyIcon className="h-12 w-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search books by title or author..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="purchaseDate">Purchase Date</SelectItem>
                    <SelectItem value="lastRead">Last Read</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <BarsArrowUpIcon className="h-4 w-4" /> : <BarsArrowDownIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Library Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Books</TabsTrigger>
            <TabsTrigger value="reading">Currently Reading</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedBooks.map(book => (
                <Card key={book._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      {getStatusBadge(book)}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-100 text-green-800">
                        Owned
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(book.rating)}
                      <span className="text-sm text-gray-500 ml-1">({book.totalReviews})</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{book.readingProgress}%</span>
                      </div>
                      <Progress value={book.readingProgress} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {book.currentPage} / {book.totalPages} pages
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/ebook-reader/${book._id}`)}
                      >
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        Read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => book.isInWishlist ? handleRemoveFromWishlist(book._id) : handleAddToWishlist(book._id)}
                      >
                        <HeartIcon className={`h-4 w-4 ${book.isInWishlist ? 'fill-current text-red-500' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShareIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reading" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedBooks.filter(book => book.readingProgress > 0 && !book.isCompleted).map(book => (
                <Card key={book._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      <Badge className="bg-blue-100 text-blue-800">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Reading
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{book.readingProgress}%</span>
                      </div>
                      <Progress value={book.readingProgress} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {book.currentPage} / {book.totalPages} pages
                      </p>
                      {book.lastRead && (
                        <p className="text-xs text-gray-500">
                          Last read: {new Date(book.lastRead).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/ebook-reader/${book._id}`)}
                      >
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                      <Button variant="outline" size="sm">
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedBooks.filter(book => book.isCompleted).map(book => (
                <Card key={book._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        <TrophyIcon className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(book.rating)}
                      <span className="text-sm text-gray-500 ml-1">({book.totalReviews})</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Reading Time</span>
                        <span>{Math.floor(book.readingTime / 60)}h {book.readingTime % 60}m</span>
                      </div>
                      {book.completionDate && (
                        <p className="text-xs text-gray-500">
                          Completed: {new Date(book.completionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/ebook-reader/${book._id}`)}
                      >
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        Re-read
                      </Button>
                      <Button variant="outline" size="sm">
                        <StarIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShareIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedBooks.filter(book => book.isInWishlist).map(book => (
                <Card key={book._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      <Badge className="bg-red-100 text-red-800">
                        <HeartIcon className="h-3 w-3 mr-1 fill-current" />
                        Favorite
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(book.rating)}
                      <span className="text-sm text-gray-500 ml-1">({book.totalReviews})</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{book.readingProgress}%</span>
                      </div>
                      <Progress value={book.readingProgress} className="h-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/ebook-reader/${book._id}`)}
                      >
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        Read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(book._id)}
                      >
                        <HeartIcon className="h-4 w-4 fill-current text-red-500" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShareIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredAndSortedBooks.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No books found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => navigate('/browse')}>
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Browse Books
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserLibraryManagement;

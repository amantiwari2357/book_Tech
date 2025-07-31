import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpenIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  CalendarIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FilterIcon,
  SortAscendingIcon,
  BookmarkIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface LibraryBook {
  _id: string;
  bookId: string;
  title: string;
  author: string;
  coverImage?: string;
  fileUrl: string;
  fileType: 'pdf' | 'epub' | 'mobi';
  fileSize: number;
  downloadCount: number;
  lastReadAt?: string;
  readingProgress: number;
  totalPages: number;
  currentPage: number;
  readingTime: number;
  isDownloaded: boolean;
  isFavorited: boolean;
  addedAt: string;
  expiresAt?: string;
}

interface ReadingSession {
  _id: string;
  bookId: string;
  startTime: string;
  endTime?: string;
  pagesRead: number;
  readingSpeed: number;
}

const MyLibrary: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [showReader, setShowReader] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLibrary();
      fetchReadingSessions();
    }
  }, [user]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/books/my-library');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch library:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadingSessions = async () => {
    try {
      const res = await authFetch('/books/reading-sessions');
      if (res.ok) {
        const data = await res.json();
        setReadingSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch reading sessions:', error);
    }
  };

  const downloadBook = async (book: LibraryBook) => {
    try {
      const res = await authFetch(`/books/${book.bookId}/download`, {
        method: 'POST'
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.title}.${book.fileType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Update download count
        setBooks(books.map(b => 
          b._id === book._id 
            ? { ...b, downloadCount: b.downloadCount + 1, isDownloaded: true }
            : b
        ));
      }
    } catch (error) {
      console.error('Failed to download book:', error);
    }
  };

  const startReading = async (book: LibraryBook) => {
    try {
      const res = await authFetch(`/books/${book.bookId}/start-reading`, {
        method: 'POST'
      });

      if (res.ok) {
        setSelectedBook(book);
        setShowReader(true);
      }
    } catch (error) {
      console.error('Failed to start reading:', error);
    }
  };

  const toggleFavorite = async (book: LibraryBook) => {
    try {
      const res = await authFetch(`/books/${book.bookId}/favorite`, {
        method: book.isFavorited ? 'DELETE' : 'POST'
      });

      if (res.ok) {
        setBooks(books.map(b => 
          b._id === book._id 
            ? { ...b, isFavorited: !b.isFavorited }
            : b
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getFilteredBooks = () => {
    let filtered = books;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(book => {
        switch (filterType) {
          case 'downloaded':
            return book.isDownloaded;
          case 'favorites':
            return book.isFavorited;
          case 'reading':
            return book.readingProgress > 0 && book.readingProgress < 100;
          case 'completed':
            return book.readingProgress === 100;
          default:
            return true;
        }
      });
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'progress':
          return b.readingProgress - a.readingProgress;
        case 'size':
          return b.fileSize - a.fileSize;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getTotalReadingTime = () => {
    return readingSessions.reduce((total, session) => {
      if (session.endTime) {
        const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
        return total + duration / (1000 * 60); // Convert to minutes
      }
      return total;
    }, 0);
  };

  const getAverageReadingSpeed = () => {
    const completedSessions = readingSessions.filter(s => s.endTime);
    if (completedSessions.length === 0) return 0;
    
    const totalSpeed = completedSessions.reduce((sum, session) => sum + session.readingSpeed, 0);
    return Math.round(totalSpeed / completedSessions.length);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your library.</p>
        </div>
      </div>
    );
  }

  const filteredBooks = getFilteredBooks();

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
              <h1 className="text-xl font-bold text-gray-900">My Library</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                Sync Library
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Books</p>
                  <p className="text-2xl font-bold">{books.length}</p>
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
                  <p className="text-2xl font-bold">{formatReadingTime(getTotalReadingTime())}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg. Speed</p>
                  <p className="text-2xl font-bold">{getAverageReadingSpeed()} wpm</p>
                </div>
                <StarIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">
                    {books.filter(b => b.readingProgress === 100).length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Books</option>
                <option value="downloaded">Downloaded</option>
                <option value="favorites">Favorites</option>
                <option value="reading">Currently Reading</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="progress">Reading Progress</option>
                <option value="size">File Size</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
                Mobile
              </Button>
              <Button variant="outline" size="sm">
                <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                Desktop
              </Button>
              <Button variant="outline" size="sm">
                <TabletIcon className="w-4 h-4 mr-2" />
                Tablet
              </Button>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <Card key={book._id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <BookOpenIcon className="w-12 h-12 text-gray-400" />
                    )}
                    
                    {/* Progress Overlay */}
                    {book.readingProgress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{book.readingProgress}%</span>
                        </div>
                        <Progress value={book.readingProgress} className="h-1" />
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {book.isDownloaded && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CloudArrowDownIcon className="w-3 h-3 mr-1" />
                          Downloaded
                        </Badge>
                      )}
                      {book.isFavorited && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          <StarIcon className="w-3 h-3 mr-1" />
                          Favorite
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 truncate mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span>{formatFileSize(book.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="uppercase">{book.fileType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downloads:</span>
                      <span>{book.downloadCount}</span>
                    </div>
                    {book.lastReadAt && (
                      <div className="flex justify-between">
                        <span>Last Read:</span>
                        <span>{new Date(book.lastReadAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => startReading(book)}
                      className="flex-1"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      {book.readingProgress > 0 ? 'Continue' : 'Start Reading'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBook(book)}
                      disabled={book.isDownloaded}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFavorite(book)}
                    >
                      <StarIcon className={`w-4 h-4 ${book.isFavorited ? 'text-yellow-500 fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching books found' : 'Your library is empty'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Purchase books to add them to your library.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/browse')}>
                  Browse Books
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reading Session Modal */}
      {showReader && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Start Reading Session</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedBook.title}</p>
                <p className="text-sm text-gray-500">by {selectedBook.author}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Progress:</span>
                  <span>{selectedBook.readingProgress}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pages Read:</span>
                  <span>{selectedBook.currentPage} / {selectedBook.totalPages}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reading Time:</span>
                  <span>{formatReadingTime(selectedBook.readingTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowReader(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => {
                setShowReader(false);
                navigate(`/reader/${selectedBook.bookId}`);
              }}>
                Start Reading
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLibrary; 
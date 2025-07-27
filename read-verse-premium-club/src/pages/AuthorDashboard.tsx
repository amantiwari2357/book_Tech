import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { authFetch } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have a Textarea component
import BookGrid from '@/components/Books/BookGrid';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1'];

type Book = {
  _id?: string;
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
  status?: string;
  sales?: number;
  earnings?: number;
};

type ReadingStats = {
  booksRead: number;
  pagesRead: number;
  streak: number;
  // add other fields as needed
};

// Helper: Get user's favorite category (most orders or most books)
function getFavoriteCategory(user: any, books: any[]) {
  if (!user || !user.orders || !books.length) return null;
  const catCount: Record<string, number> = {};
  user.orders.forEach((o: any) => {
    const book = books.find((b) => b._id === (typeof o.book === 'object' ? o.book._id : o.book));
    if (book && book.category) catCount[book.category] = (catCount[book.category] || 0) + 1;
  });
  const sorted = Object.entries(catCount).sort((a, b) => (b[1] as number) - (a[1] as number));
  return sorted.length ? sorted[0][0] : null;
}
// Helper: Get trending/new releases in favorite category
function getTrendingInCategory(category: string, books: any[]) {
  if (!category) return [];
  return books.filter((b) => b.category === category).slice(0, 3);
}
// Helper: Recommended books: top 3 by rating
function getRecommendedBooks(books: any[]) {
  return [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
}

const AuthorDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { books, featuredBooks } = useAppSelector((state) => state.books);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    author: user?.name || '',
    description: '',
    price: '',
    coverImage: '',
    category: '',
    genre: '',
    tags: '',
    isPremium: false,
    readingType: '', // <-- Added
  });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  // If stats structure is unknown, use unknown instead of any
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if ('role' in user && user.role === 'admin') {
      navigate('/admin-dashboard');
    } else if ('role' in user && user.role !== 'author') {
      navigate('/customer-dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/books/my/books');
      if (res.ok) {
        const data = await res.json();
        // setBooks(data); // This line was removed as per the new_code, as books are now from Redux
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to load books');
        toast({
          title: 'Error',
          description: errData.message || 'Failed to load books',
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      setError('Failed to load books');
      toast({
        title: 'Error',
        description: 'Failed to load books',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'author') {
      fetchBooks();
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, user?.role]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await authFetch('/users/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.readingStats);
        setAchievements(data.achievements);
      }
    } catch (err) {
      // Optionally log or set an error state
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await authFetch('/orders/author-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await authFetch(`/orders/update-status/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: status }),
      });
      if (res.ok) {
        fetchOrders(); // Refresh orders
        toast({
          title: 'Success',
          description: 'Order status updated successfully!',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    // Frontend validation for minimum price
    const priceValue = parseFloat(form.price) || 0;
    if (priceValue < 1) {
      setError('Book price must be at least ₹1.00 (100 paise) for payment.');
      toast({
        title: 'Error',
        description: 'Book price must be at least ₹1.00 (100 paise) for payment.',
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const bookData = {
      ...form,
      price: priceValue,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      readingType: form.readingType, // <-- Ensure this is present
    };

    try {
      let res;
      if (editingId) {
        res = await authFetch(`/books/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(bookData),
        });
      } else {
        res = await authFetch('/books', {
          method: 'POST',
          body: JSON.stringify(bookData),
        });
      }

      if (res.ok) {
        toast({
          title: 'Success',
          description: `Book ${editingId ? 'updated' : 'uploaded'} successfully!`,
        });
        setForm({
          title: '',
          author: user?.name || '',
          description: '',
          price: '',
          coverImage: '',
          category: '',
          genre: '',
          tags: '',
          isPremium: false,
          readingType: '', // <-- Reset here too
        });
        setEditingId(null);
        fetchBooks();
        setShowUploadModal(false); // Close modal on success
      } else {
        const data = await res.json();
        setError(data.message || 'Operation failed');
        toast({
          title: 'Error',
          description: data.message || 'Operation failed',
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      setError(`Operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast({
        title: 'Error',
        description: `Operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price.toString(),
      coverImage: book.coverImage,
      category: book.category,
      genre: book.genre,
      tags: book.tags ? book.tags.join(', ') : '',
      isPremium: book.isPremium || false,
      readingType: book.readingType || '', // Initialize readingType
    });
    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowUploadModal(true); // Open modal for editing
  };

  const handleDelete = async (bookId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`/books/${bookId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Book deleted successfully!',
        });
        fetchBooks();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete book');
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete book',
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      setError('Failed to delete book');
      toast({
        title: 'Error',
        description: 'Failed to delete book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Analytics for author
  const statusCounts = ['pending', 'approved', 'rejected'].map((status) => ({
    status,
    count: books.filter((b) => b.status === status).length,
  }));

  const totalEarnings = books.reduce((sum, b) => sum + (b.earnings || 0), 0);
  const totalSales = books.reduce((sum, b) => sum + (b.sales || 0), 0);

  // Data for Sales by Book chart (Top 5)
  const salesByBookData = books.map((book) => ({
    title: book.title,
    sales: book.sales || 0,
  })).sort((a, b) => b.sales - a.sales).slice(0, 5);

  // Data for Category distribution pie chart
  const categoryCounts = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.keys(categoryCounts).map((category) => ({
    name: category,
    value: categoryCounts[category],
  }));

  const isPaidMember = user?.subscription === 'premium' || user?.subscription === 'enterprise';
  const favoriteCategory = getFavoriteCategory(user, books);
  const trendingInCategory = getTrendingInCategory(favoriteCategory, books);
  const recommendedBooks = getRecommendedBooks(books);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Author Dashboard</h1>
      <p className="mb-8 text-lg text-muted-foreground text-center">
        Welcome, {user?.name}! Here you can manage and upload your books.
      </p>
      {user && stats && (
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 items-center">
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-2xl font-bold text-primary">{stats?.booksRead}</div>
              <div className="text-muted-foreground">Books Read</div>
            </div>
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-2xl font-bold text-primary">{stats.pagesRead}</div>
              <div className="text-muted-foreground">Pages Read</div>
            </div>
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-2xl font-bold text-primary">{stats.streak}</div>
              <div className="text-muted-foreground">Day Streak</div>
            </div>
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-lg font-semibold text-accent mb-2">Achievements</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {achievements.length === 0 && <span className="text-muted-foreground text-sm">No badges yet</span>}
                {achievements.includes('first-book') && <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">First Book</span>}
                {achievements.includes('10-day-streak') && <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">10 Day Streak</span>}
                {achievements.includes('1000-pages') && <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">1000 Pages</span>}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Show Recommended and Featured Books for paid authors */}
      {isPaidMember && (
        <>
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Recommended Books</h2>
            <BookGrid books={recommendedBooks} />
          </section>
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Featured Books</h2>
            <BookGrid books={featuredBooks} />
          </section>
        </>
      )}
      <div className="flex justify-center gap-4 mb-6 sm:mb-8">
        <Button size="lg" onClick={() => setShowUploadModal(true)}>
          Upload Book
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/book-design')}>
          Design Book
        </Button>
      </div>

      {/* --- Key Metrics Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Card className="p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <h3 className="font-semibold text-xl mb-2 text-gray-700">Total Earnings</h3>
          <div className="text-5xl font-extrabold text-green-600">
            ${totalEarnings.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Revenue from all your books</p>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <h3 className="font-semibold text-xl mb-2 text-gray-700">Total Sales</h3>
          <div className="text-5xl font-extrabold text-blue-600">
            {totalSales}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Units sold across all titles</p>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <h3 className="font-semibold text-xl mb-2 text-gray-700">Total Books</h3>
          <div className="text-5xl font-extrabold text-purple-600">
            {books.length}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Your current book count</p>
        </Card>
      </div>

      {/* --- Analytics Charts Section --- */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">Your Book Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Card className="p-4 shadow-lg">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Books by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" fill="#8884d8" name="Number of Books" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {salesByBookData.length > 0 && (
          <Card className="p-4 shadow-lg">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Top 5 Books by Sales</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesByBookData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <YAxis dataKey="title" type="category" width={100} />
                <XAxis type="number" allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="sales" fill="#82ca9d" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {categoryData.length > 0 && (
          <Card className="p-4 shadow-lg">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Books by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* --- Your Books Table --- */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">Your Published Books</h2>
      {loading ? (
        <p className="text-center text-lg text-muted-foreground">Loading books...</p>
      ) : error ? (
        <p className="text-red-500 text-center text-lg">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-md border shadow-md">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">Title</th>
                <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">Category</th>
                <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">Status</th>
                <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">Sales</th>
                <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">Earnings</th>
                <th className="p-2 sm:p-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground text-lg">
                    You haven't uploaded any books yet. Start by using the form above!
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="border-t hover:bg-muted/50">
                    <td className="p-2 sm:p-4 font-medium text-gray-900">{book.title}</td>
                    <td className="p-2 sm:p-4 text-gray-700">{book.category || 'N/A'}</td>
                    <td className="p-2 sm:p-4 capitalize">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${book.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${book.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${book.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-gray-700">{book.sales || 0}</td>
                    <td className="p-2 sm:p-4 text-gray-700">${(book.earnings || 0).toFixed(2)}</td>
                    <td className="p-2 sm:p-4 space-x-3">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(book as unknown as Book)} className="text-sm px-4 py-2">
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="text-sm px-4 py-2">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your book
                              "<span className="font-semibold">{book.title}</span>" from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(book.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{editingId ? 'Edit Existing Book' : 'Upload a New Book'}</AlertDialogTitle>
            <AlertDialogDescription>
              Fill out the form below to {editingId ? 'update your book' : 'upload a new book'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            onSubmit={handleFormSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="title" className="text-base">Book Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required className="mt-1 p-2 border rounded-md w-full" />
            </div>

            <div>
              <Label htmlFor="author" className="text-base">Author Name</Label>
              <Input id="author" name="author" value={form.author} onChange={handleChange} required disabled={!!user?.name} className="mt-1 p-2 border rounded-md w-full bg-gray-100" />
            </div>

            <div>
              <Label htmlFor="price" className="text-base">Price (₹)</Label>
              <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 p-2 border rounded-md w-full" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="mt-1 p-2 border rounded-md w-full resize-y"
                required
              />
            </div>

            <div>
              <Label htmlFor="coverImage" className="text-base">Cover Image URL</Label>
              <Input id="coverImage" name="coverImage" value={form.coverImage} onChange={handleChange} className="mt-1 p-2 border rounded-md w-full" />
            </div>

            <div>
              <Label htmlFor="category" className="text-base">Category</Label>
              <Input id="category" name="category" value={form.category} onChange={handleChange} className="mt-1 p-2 border rounded-md w-full" />
            </div>

            <div>
              <Label htmlFor="genre" className="text-base">Genre</Label>
              <Input id="genre" name="genre" value={form.genre} onChange={handleChange} className="mt-1 p-2 border rounded-md w-full" />
            </div>

            <div>
              <Label htmlFor="tags" className="text-base">Tags (comma separated)</Label>
              <Input id="tags" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g., fiction, adventure, fantasy" className="mt-1 p-2 border rounded-md w-full" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <Label className="text-base">Reading Type <span className="text-red-500">*</span></Label>
              <div className="flex gap-8 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="readingType"
                    value="soft"
                    checked={form.readingType === 'soft'}
                    onChange={handleChange}
                    required
                  />
                  Only Soft Copy (Read Online)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="readingType"
                    value="hard"
                    checked={form.readingType === 'hard'}
                    onChange={handleChange}
                    required
                  />
                  Wants to Offer Hard Copy (Delivery Available)
                </label>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPremium"
                name="isPremium"
                checked={form.isPremium}
                onChange={handleChange}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary-500"
              />
              <Label htmlFor="isPremium" className="text-base">Mark as Premium Book</Label>
            </div>

            {error && <p className="text-red-500 text-sm mt-2 col-span-1 md:col-span-2">{error}</p>}

            <div className="col-span-1 md:col-span-2 flex gap-4 mt-4">
              <Button type="submit" disabled={uploading} className="w-full md:w-auto px-6 py-3 text-lg font-semibold">
                {uploading ? (editingId ? 'Saving Changes...' : 'Uploading Book...') : editingId ? 'Update Book' : 'Upload New Book'}
              </Button>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline" className="w-full md:w-auto px-6 py-3 text-lg font-semibold" onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: '',
                    author: user?.name || '',
                    description: '',
                    price: '',
                    coverImage: '',
                    category: '',
                    genre: '',
                    tags: '',
                    isPremium: false,
                    readingType: '', // <-- Reset here too
                  });
                }}>
                  Cancel
                </Button>
              </AlertDialogCancel>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Orders Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Orders for Your Books</h2>
        <button
          onClick={async () => {
            try {
              const res = await authFetch('/razorpay/test');
              if (res.ok) {
                const data = await res.json();
                console.log('Test response:', data);
                toast({ title: 'Success', description: 'Route is working!', });
              }
            } catch (err) {
              console.error('Test failed:', err);
              toast({ title: 'Error', description: 'Route test failed', variant: 'destructive', });
            }
          }}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Razorpay Route
        </button>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Book</th>
                  <th className="border border-gray-300 p-3 text-left">Customer</th>
                  <th className="border border-gray-300 p-3 text-left">Amount</th>
                  <th className="border border-gray-300 p-3 text-left">Payment Status</th>
                  <th className="border border-gray-300 p-3 text-left">Order Status</th>
                  <th className="border border-gray-300 p-3 text-left">Date</th>
                  <th className="border border-gray-300 p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3">
                      <div>
                        <div className="font-semibold">{order.book?.title}</div>
                        <div className="text-sm text-gray-600">by {order.book?.author}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3">
                      <div>
                        <div className="font-semibold">{order.customer?.name}</div>
                        <div className="text-sm text-gray-600">{order.customer?.email}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3">₹{order.amount}</td>
                    <td className="border border-gray-300 p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 p-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                        disabled={order.paymentStatus !== 'paid'}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      {order.paymentStatus !== 'paid' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Wait for payment
                          <button
                            onClick={async () => {
                              try {
                                console.log('Attempting to update payment status for:', order.paymentLinkId);
                                const res = await authFetch('/razorpay/update-payment-status', {
                                  method: 'POST',
                                  body: JSON.stringify({
                                    paymentLinkId: order.paymentLinkId,
                                    status: 'paid'
                                  }),
                                });
                                console.log('Response status:', res.status);
                                if (res.ok) {
                                  const data = await res.json();
                                  console.log('Success response:', data);
                                  fetchOrders();
                                  toast({ title: 'Success', description: 'Payment status updated!', });
                                } else {
                                  const errorData = await res.json().catch(() => ({}));
                                  console.error('Error response:', errorData);
                                  toast({ title: 'Error', description: errorData.message || 'Failed to update payment status', variant: 'destructive', });
                                }
                              } catch (err) {
                                console.error('Exception:', err);
                                toast({ title: 'Error', description: 'Failed to update payment status', variant: 'destructive', });
                              }
                            }}
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Mark as Paid
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;
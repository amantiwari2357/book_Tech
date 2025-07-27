import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authFetch } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { saveAs } from 'file-saver';
import { UserIcon, BookOpenIcon, CurrencyDollarIcon, ChartBarIcon, UsersIcon, StarIcon, ArrowTrendingUpIcon, HomeIcon, Cog6ToothIcon, BellIcon } from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import AdminBookApprovals from './AdminBookApprovals';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  // add other fields as needed
};

type Book = {
  _id: string;
  title: string;
  author: string;
  price?: number | string;
  description?: string;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
  // add other fields as needed
};

type Analytics = {
  userCounts?: Record<string, number>;
  bookCategoryCounts?: Record<string, number>;
  bookOrderCounts?: Record<string, number>;
  userGrowth?: Record<string, number>;
  salesByMonth?: Record<string, number>;
  revenueByMonth?: Record<string, number>;
  topAuthors?: Array<{ author: string; sales: number }>;
  totalUsers?: number;
  totalBooks?: number;
  totalRevenue?: number;
  activeUsers?: number;
  // add other fields as needed
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57'];

type SummaryCardProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  trend?: number;
  trendDir?: 'up' | 'down';
  className?: string;
};

// Inline SummaryCard component for dashboard metrics
const SummaryCard = ({ icon, label, value, trend, trendDir, className = '' }: SummaryCardProps) => (
  <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6 flex items-center gap-4 ${className}`}>
    <div className="bg-primary/10 rounded-full p-3">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold leading-tight">{value}</div>
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        {label}
        {trend !== undefined && (
          <span className={`ml-2 flex items-center text-xs ${trendDir === 'up' ? 'text-green-600' : 'text-red-600'}`}> 
            {trendDir === 'up' ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ChartBarIcon className="w-4 h-4 rotate-180" />} {trend}%
          </span>
        )}
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', role: 'customer' });
  const [editBookForm, setEditBookForm] = useState({ title: '', author: '', price: '', description: '', category: '', tags: '', isPremium: false });
  const [saving, setSaving] = useState(false);
  // Search/filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('');
  // Analytics state
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // Pagination state
  const [userPage, setUserPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);
  const USERS_PER_PAGE = 10;
  const BOOKS_PER_PAGE = 10;

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, booksRes] = await Promise.all([
        authFetch('/admin/users'),
        authFetch('/admin/books'),
      ]);
      setUsers(await usersRes.json());
      setBooks(await booksRes.json());
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await authFetch('/admin/analytics');
      setAnalytics(await res.json());
    } catch {
      setAnalyticsError('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
      fetchAnalytics();
    }
    // eslint-disable-next-line
  }, [user]);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    try {
      const res = await authFetch(`/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        toast({ title: 'User deleted', description: 'User has been deleted.' });
      } else {
        setError('Failed to delete user');
        toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
      }
    } catch {
      setError('Failed to delete user');
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Delete this book?')) return;
    setError('');
    try {
      const res = await authFetch(`/admin/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        toast({ title: 'Book deleted', description: 'Book has been deleted.' });
      } else {
        setError('Failed to delete book');
        toast({ title: 'Error', description: 'Failed to delete book.', variant: 'destructive' });
      }
    } catch {
      setError('Failed to delete book');
      toast({ title: 'Error', description: 'Failed to delete book.', variant: 'destructive' });
    }
  };

  // Edit User
  const openEditUser = (u: User) => {
    setEditUser(u);
    setEditUserForm({ name: u.name || '', email: u.email || '', role: u.role || 'customer' });
  };
  const closeEditUser = () => { setEditUser(null); };
  const saveEditUser = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await authFetch(`/admin/users/${editUser._id}`, {
        method: 'PUT',
        body: JSON.stringify(editUserForm),
      });
      if (res.ok) {
        closeEditUser();
        fetchData();
        toast({ title: 'User updated', description: 'User details have been updated successfully.' });
      } else {
        setError('Failed to update user');
        toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' });
      }
    } catch {
      setError('Failed to update user');
      toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' });
    }
    setSaving(false);
  };

  // Edit Book
  const openEditBook = (b: Book) => {
    setEditBook(b);
    setEditBookForm({
      title: b.title || '',
      author: b.author || '',
      price: b.price?.toString() || '',
      description: b.description || '',
      category: b.category || '',
      tags: (b.tags || []).join(', '),
      isPremium: !!b.isPremium,
    });
  };
  const closeEditBook = () => { setEditBook(null); };
  const saveEditBook = async () => {
    setSaving(true);
    setError('');
    try {
      const book = {
        ...editBookForm,
        price: parseFloat(editBookForm.price) || 0,
        tags: editBookForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await authFetch(`/admin/books/${editBook._id}`, {
        method: 'PUT',
        body: JSON.stringify(book),
      });
      if (res.ok) {
        closeEditBook();
        fetchData();
        toast({ title: 'Book updated', description: 'Book details have been updated successfully.' });
      } else {
        setError('Failed to update book');
        toast({ title: 'Error', description: 'Failed to update book.', variant: 'destructive' });
      }
    } catch {
      setError('Failed to update book');
      toast({ title: 'Error', description: 'Failed to update book.', variant: 'destructive' });
    }
    setSaving(false);
  };

  // Filtered users and books
  const filteredUsers = users.filter(u =>
    (userSearch === '' || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())) &&
    (userRoleFilter === '' || u.role === userRoleFilter)
  );
  const filteredBooks = books.filter(b =>
    (bookSearch === '' || b.title?.toLowerCase().includes(bookSearch.toLowerCase()) || b.author?.toLowerCase().includes(bookSearch.toLowerCase())) &&
    (bookCategoryFilter === '' || b.category === bookCategoryFilter)
  );
  const allCategories = Array.from(new Set(books.map(b => b.category).filter(Boolean)));

  const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * BOOKS_PER_PAGE, bookPage * BOOKS_PER_PAGE);
  const userTotalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const bookTotalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1;

  // Helper: Convert array of objects to CSV
  function toCSV<T extends Record<string, unknown>>(data: T[], columns: string[]) {
    const header = columns.join(',');
    const rows = data.map(row => columns.map(col => JSON.stringify(row[col] ?? '')).join(','));
    return [header, ...rows].join('\n');
  }

  const handleExport = (type: 'users' | 'books' | 'analytics') => {
    let csv = '';
    if (type === 'users') {
      csv = toCSV(users, ['_id', 'name', 'email', 'role', 'subscription']);
    } else if (type === 'books') {
      csv = toCSV(books, ['_id', 'title', 'author', 'category', 'price', 'status', 'sales', 'earnings']);
    } else if (type === 'analytics' && analytics) {
      const flat = Object.entries(analytics).map(([k, v]) => ({ metric: k, value: typeof v === 'object' ? JSON.stringify(v) : v }));
      csv = toCSV(flat, ['metric', 'value']);
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${type}-export.csv`);
    toast({ title: 'Exported', description: `Exported ${type} data as CSV.` });
  };

  // Prepare chart data
  const userRoleData = analytics ? Object.entries(analytics.userCounts || {}).map(([role, count]) => ({ name: role, value: count as number })) : [];
  const bookCategoryData = analytics ? Object.entries(analytics.bookCategoryCounts || {}).map(([cat, count]) => ({ name: cat, value: count as number })) : [];
  const popularBooks = analytics && analytics.bookOrderCounts && books.length > 0
    ? Object.entries(analytics.bookOrderCounts)
        .map(([bookId, count]) => {
          const book = books.find(b => b._id === bookId);
          return book ? { title: book.title, count } : null;
        })
        .filter(Boolean)
        .sort((a, b) => (b!.count as number) - (a!.count as number))
        .slice(0, 5)
    : [];
  const userGrowthData = analytics && analytics.userGrowth ? Object.entries(analytics.userGrowth).map(([month, count]) => ({ month, count })) : [];
  const salesByMonthData = analytics && analytics.salesByMonth ? Object.entries(analytics.salesByMonth).map(([month, count]) => ({ month, count })) : [];
  const revenueByMonthData = analytics && analytics.revenueByMonth ? Object.entries(analytics.revenueByMonth).map(([month, value]) => ({ month, value })) : [];
  const topAuthorsData = analytics && analytics.topAuthors ? analytics.topAuthors : [];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <BookOpenIcon className="w-7 h-7 text-primary" />
              <span className="font-serif text-xl font-bold text-primary">Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={true} tooltip="Dashboard">
                    <Link to="/admin-dashboard">
                      <HomeIcon className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users">
                    <a href="#users">
                      <UsersIcon className="w-5 h-5" />
                      <span>Users</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Books">
                    <a href="#books">
                      <BookOpenIcon className="w-5 h-5" />
                      <span>Books</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Analytics">
                    <a href="#analytics">
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Analytics</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Notifications">
                    <Link to="/notifications">
                      <BellIcon className="w-5 h-5" />
                      <span>Notifications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <a href="#settings">
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Book Approvals">
                    <Link to="/admin-book-approvals">
                      <BookOpenIcon className="w-5 h-5" />
                      <span>Book Approvals</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Book Management">
                    <Link to="/admin-book-management">
                      <BookOpenIcon className="w-5 h-5" />
                      <span>Book Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Plan Management">
                    <Link to="/admin-plan-management">
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span>Plan Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Export Data">
                    <button onClick={() => handleExport('analytics')}>
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Export Analytics</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-2 mt-2">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold uppercase">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-bold text-sm">{user?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        {/* Main Content */}
        <div className="flex-1">
          <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 tracking-tight">Admin Dashboard</h1>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
              <SummaryCard icon={<UsersIcon className="w-7 h-7 text-primary" />} label="Total Users" value={analytics?.totalUsers ?? '--'} />
              <SummaryCard icon={<BookOpenIcon className="w-7 h-7 text-primary" />} label="Total Books" value={analytics?.totalBooks ?? '--'} />
              <SummaryCard icon={<CurrencyDollarIcon className="w-7 h-7 text-primary" />} label="Revenue" value={analytics?.totalRevenue ?? '--'} />
              <SummaryCard icon={<StarIcon className="w-7 h-7 text-primary" />} label="Active Users" value={analytics?.activeUsers ?? '--'} />
            </div>
            {/* Analytics Section */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                Analytics
                <Button size="sm" variant="outline" onClick={() => handleExport('analytics')}>Export Analytics CSV</Button>
              </h2>
              {analyticsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-40 sm:h-56 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : analyticsError ? <p className="text-red-500">{analyticsError}</p> : analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {/* ... analytics cards/charts ... */}
                  {/* (keep your chart code here, but wrap each in a card with shadow/rounded bg) */}
                  <div className="bg-white rounded-xl shadow p-4 col-span-1">
                    <h3 className="font-semibold mb-2">User Growth</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={userGrowthData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" />
                        <RechartsTooltip />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 col-span-1">
                    <h3 className="font-semibold mb-2">Book Sales by Month</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={salesByMonthData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Bar dataKey="count" fill="#82ca9d" />
                        <RechartsTooltip />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 col-span-1">
                    <h3 className="font-semibold mb-2">Revenue by Month</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={revenueByMonthData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Line type="monotone" dataKey="value" stroke="#ffc658" />
                        <RechartsTooltip />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 col-span-1">
                    <h3 className="font-semibold mb-2">Top Authors by Sales</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topAuthorsData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <XAxis dataKey="author" />
                        <YAxis allowDecimals={false} />
                        <Bar dataKey="sales" fill="#8884d8" />
                        <RechartsTooltip />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 col-span-1 flex flex-col items-center justify-center">
                    <h3 className="font-semibold mb-2">Active Users (last 30 days)</h3>
                    <div className="text-4xl font-bold text-primary mt-8">{analytics.activeUsers}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 col-span-1 flex flex-col items-center justify-center">
                    <h3 className="font-semibold mb-2">Export Data</h3>
                    <Button size="sm" variant="outline" onClick={() => handleExport('users')}>Export Users CSV</Button>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => handleExport('books')}>Export Books CSV</Button>
                  </div>
                </div>
              )}
            </div>
            {/* Users & Books Management */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-64 sm:h-96 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? <p className="text-red-500">{error}</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                {/* Users List */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Users</h2>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
                    <input className="p-2 border rounded w-full" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                    <select className="p-2 border rounded" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                      <option value="">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {paginatedUsers.length === 0 ? <p>No users found.</p> : paginatedUsers.map((u) => (
                    <Card key={u._id} className="p-4 mb-2 flex items-center justify-between hover:shadow transition-shadow">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-6 h-6 text-primary" />
                        <div>
                          <div className="font-bold">{u.name} ({u.email})</div>
                          <div className="text-sm text-muted-foreground">Role: {u.role}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => openEditUser(u)}>Edit</Button>
                        <Button variant="destructive" onClick={() => handleDeleteUser(u._id)}>Delete</Button>
                      </div>
                    </Card>
                  ))}
                  {userTotalPages > 1 && (
                    <Pagination className="mt-3 sm:mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => setUserPage((p) => Math.max(1, p - 1))} />
                        </PaginationItem>
                        {[...Array(userTotalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink isActive={userPage === i + 1} onClick={() => setUserPage(i + 1)}>{i + 1}</PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
                {/* Books List */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Books</h2>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
                    <input className="p-2 border rounded w-full" placeholder="Search books..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
                    <select className="p-2 border rounded" value={bookCategoryFilter} onChange={e => setBookCategoryFilter(e.target.value)}>
                      <option value="">All Categories</option>
                      {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  {paginatedBooks.length === 0 ? <p>No books found.</p> : paginatedBooks.map((b) => (
                    <Card key={b._id} className="p-4 mb-2 flex items-center justify-between hover:shadow transition-shadow">
                      <div className="flex items-center gap-3">
                        <BookOpenIcon className="w-6 h-6 text-primary" />
                        <div>
                          <div className="font-bold">{b.title}</div>
                          <div className="text-sm text-muted-foreground">by {b.author}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => openEditBook(b)}>Edit</Button>
                        <Button variant="destructive" onClick={() => handleDeleteBook(b._id)}>Delete</Button>
                      </div>
                    </Card>
                  ))}
                  {bookTotalPages > 1 && (
                    <Pagination className="mt-3 sm:mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => setBookPage((p) => Math.max(1, p - 1))} />
                        </PaginationItem>
                        {[...Array(bookTotalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink isActive={bookPage === i + 1} onClick={() => setBookPage(i + 1)}>{i + 1}</PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={() => setBookPage((p) => Math.min(bookTotalPages, p + 1))} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </div>
            )}
            {/* Edit User Modal */}
            {editUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg relative">
                  <button className="absolute top-2 right-2 text-xl" onClick={closeEditUser}>&times;</button>
                  <h2 className="text-2xl font-bold mb-4">Edit User</h2>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Name</label>
                    <input className="w-full p-2 border rounded" value={editUserForm.name} onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Email</label>
                    <input className="w-full p-2 border rounded" value={editUserForm.email} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Role</label>
                    <select className="w-full p-2 border rounded" value={editUserForm.role} onChange={e => setEditUserForm(f => ({ ...f, role: e.target.value }))}>
                      <option value="customer">Customer</option>
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={saveEditUser} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <Button variant="outline" onClick={closeEditUser}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Book Modal */}
            {editBook && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg relative">
                  <button className="absolute top-2 right-2 text-xl" onClick={closeEditBook}>&times;</button>
                  <h2 className="text-2xl font-bold mb-4">Edit Book</h2>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Title</label>
                    <input className="w-full p-2 border rounded" value={editBookForm.title} onChange={e => setEditBookForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Author</label>
                    <input className="w-full p-2 border rounded" value={editBookForm.author} onChange={e => setEditBookForm(f => ({ ...f, author: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Price</label>
                    <input className="w-full p-2 border rounded" type="number" value={editBookForm.price} onChange={e => setEditBookForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea className="w-full p-2 border rounded" value={editBookForm.description} onChange={e => setEditBookForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Category</label>
                    <input className="w-full p-2 border rounded" value={editBookForm.category} onChange={e => setEditBookForm(f => ({ ...f, category: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 font-medium">Tags (comma separated)</label>
                    <input className="w-full p-2 border rounded" value={editBookForm.tags} onChange={e => setEditBookForm(f => ({ ...f, tags: e.target.value }))} />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <input type="checkbox" checked={editBookForm.isPremium} onChange={e => setEditBookForm(f => ({ ...f, isPremium: e.target.checked }))} />
                    <span>Premium</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={saveEditBook} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <Button variant="outline" onClick={closeEditBook}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
            {/* Admin Book Approvals */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <AdminBookApprovals />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard; 
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCartIcon, UserIcon, BookOpenIcon, MagnifyingGlassIcon, BellIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleCart } from '@/store/slices/cartSlice';
import { setSearchTerm } from '@/store/slices/booksSlice';
import { API_BASE_URL, authFetch, removeToken } from '@/lib/api';
import { setUser } from '@/store/slices/authSlice';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { searchTerm } = useAppSelector((state) => state.books);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);

  // Global search functionality
  const performGlobalSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await authFetch(`/books/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        performGlobalSearch(searchTerm);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/notifications');
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch {}
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    if (showNotifDropdown || showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifDropdown, showProfileDropdown]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    setShowNotifDropdown((prev) => !prev);
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown((prev) => !prev);
    setShowNotifDropdown(false);
  };

  const markAsRead = async (id: string) => {
    await authFetch(`/notifications/${id}/read`, { method: 'PUT' });
    fetchNotifications();
  };

  const handleLogout = () => {
    removeToken();
    dispatch(setUser(null));
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    // Placeholder: implement backend endpoint for account deletion
    alert('Account deletion is not implemented yet.');
  };

  const totalItems = items.length;

  return (
    <header className="sticky top-0 header-z-index mobile-header bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <BookOpenIcon className="h-8 w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-serif font-bold text-primary">BookTech</span>
          </Link>

          {/* Mobile Search Bar (only visible on mobile) */}
          <div className="flex-1 mx-2 sm:hidden search-container relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search books, authors..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="pl-8 pr-3 h-9 text-sm mobile-search-bar"
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
              />
              {searchLoading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="mobile-loading-spinner rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            
            {/* Mobile Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 mobile-search-results rounded-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <Link
                    key={result._id || result.id}
                    to={`/book/${result._id || result.id}`}
                    className="flex items-center p-3 mobile-search-result-item hover:bg-gray-50 border-b last:border-b-0"
                    onClick={() => {
                      setShowSearchResults(false);
                      dispatch(setSearchTerm(''));
                    }}
                  >
                    <div className="flex-shrink-0 w-10 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      {result.coverImage ? (
                        <img
                          src={result.coverImage}
                          alt={result.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <BookOpenIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      <div className="text-xs text-gray-500 truncate">by {result.author}</div>
                      {result.category && (
                        <div className="text-xs text-blue-600 mt-1">{result.category}</div>
                      )}
                    </div>
                  </Link>
                ))}
                <div className="p-2 text-center border-t">
                  <Link
                    to={`/browse?search=${encodeURIComponent(searchTerm)}`}
                    className="text-primary hover:underline text-sm"
                    onClick={() => {
                      setShowSearchResults(false);
                    }}
                  >
                    View all results
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger for mobile */}
          <button
            className="sm:hidden p-2 ml-2 rounded focus:outline-none hover:bg-accent flex-shrink-0 mobile-button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>

          {/* Search Bar (hidden on xs, shown on sm+) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4 lg:mx-8 relative search-container">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search books, authors, categories..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="pl-10 pr-4 font-sans"
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* Desktop Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <Link
                    key={result._id || result.id}
                    to={`/book/${result._id || result.id}`}
                    className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0"
                    onClick={() => {
                      setShowSearchResults(false);
                      dispatch(setSearchTerm(''));
                    }}
                  >
                    <div className="flex-shrink-0 w-10 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      {result.coverImage ? (
                        <img
                          src={result.coverImage}
                          alt={result.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <BookOpenIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      <div className="text-xs text-gray-500 truncate">by {result.author}</div>
                      {result.category && (
                        <div className="text-xs text-blue-600 mt-1">{result.category}</div>
                      )}
                    </div>
                  </Link>
                ))}
                <div className="p-2 text-center border-t">
                  <Link
                    to={`/browse?search=${encodeURIComponent(searchTerm)}`}
                    className="text-primary hover:underline text-sm"
                    onClick={() => {
                      setShowSearchResults(false);
                    }}
                  >
                    View all results
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <Link to="/browse" className="text-foreground hover:text-primary transition-colors text-sm lg:text-base">
              Browse
            </Link>
            <Link to="/subscriptions" className="text-foreground hover:text-primary transition-colors text-sm lg:text-base">
              Plans
            </Link>
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleCart())}
              className="relative"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
            {/* Authenticated User Dropdowns */}
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifDropdownRef}>
                  <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-accent focus:outline-none">
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">{unreadCount}</span>
                    )}
                  </button>
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg dropdown-z-index max-h-96 overflow-y-auto">
                      <div className="p-2 font-semibold border-b">Notifications</div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No notifications</div>
                      ) : notifications.slice(0, 10).map((n) => (
                        <div key={n._id} className={`p-3 border-b last:border-b-0 flex items-start gap-2 ${!n.read ? 'bg-blue-50' : ''}`}
                          onClick={() => { if (!n.read) markAsRead(n._id); }}
                          style={{ cursor: !n.read ? 'pointer' : 'default' }}
                        >
                          <div className="flex-1">
                            <div className="text-sm">{n.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">{n.sender ? `From: ${n.sender.name} (${n.sender.role})` : ''}</div>
                            <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                          {!n.read && <span className="ml-2 text-xs text-blue-600 font-bold">New</span>}
                        </div>
                      ))}
                      <div className="p-2 text-center border-t">
                        <Link to="/notifications" className="text-primary hover:underline">View All</Link>
                      </div>
                    </div>
                  )}
                </div>
                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button onClick={handleProfileClick} className="p-2 rounded-full hover:bg-accent focus:outline-none">
                    {user?.avatar && !avatarError ? (
                      <>
                        {!avatarLoaded && (
                          <span className="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-full animate-pulse">
                            <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          </span>
                        )}
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className={`h-8 w-8 rounded-full object-cover border ${!avatarLoaded ? 'hidden' : ''}`}
                          onLoad={() => setAvatarLoaded(true)}
                          onError={() => { setAvatarError(true); setAvatarLoaded(true); }}
                          style={{ display: avatarLoaded ? 'block' : 'none' }}
                        />
                      </>
                    ) : user?.name ? (
                      <span className="h-8 w-8 flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    ) : (
                      <UserIcon className="h-6 w-6" />
                    )}
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg dropdown-z-index">
                      <div className="p-4 border-b">
                        <div className="font-bold">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                        <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                      </div>
                      
                      <Link to="/edit-profile" className="block px-4 py-2 hover:bg-accent">Edit Profile</Link>
                      <Link to="/notifications" className="block px-4 py-2 hover:bg-accent">Notifications</Link>
                      <Link to="/orders" className="block px-4 py-2 hover:bg-accent">My Orders</Link>
                      {user?.avatar && (
                        <button
                          onClick={async () => {
                            // Remove avatar: update backend and Redux
                            await authFetch('/users/profile', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ avatar: '' }),
                            });
                            dispatch(setUser({ ...user, avatar: '' }));
                            setAvatarError(false);
                            setAvatarLoaded(true);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-accent text-red-600"
                        >
                          Remove Avatar
                        </button>
                      )}
                      {/* Dashboard link based on role */}
                      {user?.role === 'author' && (
                        <Link to="/author-dashboard" className="block px-4 py-2 hover:bg-accent">Author Dashboard</Link>
                      )}
                      {user?.role === 'customer' && (
                        <Link to="/customer-dashboard" className="block px-4 py-2 hover:bg-accent">Customer Dashboard</Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin-dashboard" className="block px-4 py-2 hover:bg-accent">Admin Dashboard</Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-accent">Logout</button>
                      <button onClick={handleDeleteAccount} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Delete Account</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu-overlay sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="mobile-menu-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <span className="text-xl font-bold text-gray-900">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="mobile-menu-content">
                {/* Search Bar for Mobile */}
                <div className="relative mb-6">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search books, authors, categories..."
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    className="pl-10 pr-4 font-sans"
                  />
                </div>

                {/* Navigation */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mobile-text-gradient">
                    Navigation
                  </h3>
                  <div className="space-y-1">
                    <Link
                      to="/browse"
                      className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpenIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      Browse Books
                    </Link>
                    <Link
                      to="/subscriptions"
                      className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      Plans
                    </Link>
                    <button
                      className="flex items-center w-full px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                      onClick={() => {
                        dispatch(toggleCart());
                        setMobileMenuOpen(false);
                      }}
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      Cart
                      {totalItems > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-500 text-white">
                          {totalItems}
                        </Badge>
                      )}
                    </button>
                  </div>
                </div>

                {/* Notifications for Mobile */}
                {isAuthenticated && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mobile-text-gradient">
                      Notifications
                    </h3>
                    <div className="space-y-1">
                      <button
                        className="flex items-center w-full px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                        onClick={() => {
                          setShowNotifDropdown(!showNotifDropdown);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <BellIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        Notifications
                        {unreadCount > 0 && (
                          <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                            {unreadCount}
                          </Badge>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Auth Section */}
                {isAuthenticated ? (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mobile-text-gradient">
                      Account
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/edit-profile"
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        Edit Profile
                      </Link>
                      <Link
                        to="/notifications"
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BellIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        Notifications
                      </Link>
                      {user?.role === 'author' && (
                        <Link
                          to="/author-dashboard"
                          className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <BookOpenIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                          Author Dashboard
                        </Link>
                      )}
                      {user?.role === 'customer' && (
                        <Link
                          to="/customer-dashboard"
                          className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                          Customer Dashboard
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin-dashboard"
                          className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mobile-menu-item"
                      >
                        <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mobile-text-gradient">
                      Account
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/login"
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mobile-menu-item"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
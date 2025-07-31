import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
  StarIcon,
  CurrencyRupeeIcon,
  BellIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface WishlistItem {
  _id: string;
  bookId: string;
  title: string;
  author: string;
  price: number;
  coverImage?: string;
  addedAt: string;
  inStock: boolean;
  stockCount: number;
}

interface CartItem {
  _id: string;
  bookId: string;
  title: string;
  author: string;
  price: number;
  coverImage?: string;
  quantity: number;
  addedAt: string;
  inStock: boolean;
  stockCount: number;
}

const Wishlist: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('wishlist');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAbandonedCartModal, setShowAbandonedCartModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchCart();
    }
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/books/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await authFetch('/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (item: WishlistItem) => {
    try {
      const res = await authFetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId: item.bookId,
          quantity: 1
        })
      });

      if (res.ok) {
        fetchCart();
        // Optionally remove from wishlist
        removeFromWishlist(item._id);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const res = await authFetch(`/books/wishlist/${itemId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setWishlist(wishlist.filter(item => item._id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await authFetch(`/cart/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId,
          quantity
        })
      });

      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await authFetch(`/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId })
      });

      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const moveToWishlist = async (item: CartItem) => {
    try {
      const res = await authFetch('/books/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId: item.bookId
        })
      });

      if (res.ok) {
        removeFromCart(item._id);
        fetchWishlist();
      }
    } catch (error) {
      console.error('Failed to move to wishlist:', error);
    }
  };

  const shareWishlist = async () => {
    try {
      const res = await authFetch('/books/wishlist/share', {
        method: 'POST'
      });

      if (res.ok) {
        const { shareUrl } = await res.json();
        navigator.clipboard.writeText(shareUrl);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to share wishlist:', error);
    }
  };

  const clearWishlist = async () => {
    try {
      const res = await authFetch('/books/wishlist/clear', {
        method: 'DELETE'
      });

      if (res.ok) {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredWishlist = wishlist.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your wishlist.</p>
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
              <h1 className="text-xl font-bold text-gray-900">Wishlist & Cart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/checkout')}
                disabled={cart.length === 0}
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                Checkout ({getTotalItems()})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="border-b">
                <div className="flex items-center justify-between p-6">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'wishlist'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <HeartIcon className="w-5 h-5 inline mr-2" />
                      Wishlist ({wishlist.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('cart')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'cart'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ShoppingCartIcon className="w-5 h-5 inline mr-2" />
                      Cart ({getTotalItems()})
                    </button>
                  </div>
                  
                  {activeTab === 'wishlist' && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Search wishlist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                      <Button variant="outline" size="sm" onClick={shareWishlist}>
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      {wishlist.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearWishlist}>
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'wishlist' ? (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="w-16 h-20 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredWishlist.length > 0 ? (
                      filteredWishlist.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                            <p className="text-sm text-gray-500">by {item.author}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                              {!item.inStock && (
                                <Badge variant="destructive">Out of Stock</Badge>
                              )}
                              {item.inStock && item.stockCount < 5 && (
                                <Badge variant="secondary">Only {item.stockCount} left</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              disabled={!item.inStock}
                            >
                              <ShoppingCartIcon className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/book/${item.bookId}`)}
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromWishlist(item._id)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm ? 'No matching items' : 'Your wishlist is empty'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm 
                            ? 'Try adjusting your search terms'
                            : 'Start adding books to your wishlist to see them here.'
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
                ) : (
                  <div className="space-y-4">
                    {cart.length > 0 ? (
                      cart.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                            <p className="text-sm text-gray-500">by {item.author}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                              <span className="text-sm text-gray-500">× {item.quantity}</span>
                              <span className="text-lg font-bold text-green-600">
                                = ₹{item.price * item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item._id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                              >
                                <MinusIcon className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                disabled={!item.inStock || item.quantity >= item.stockCount}
                              >
                                <PlusIcon className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveToWishlist(item)}
                            >
                              <HeartIcon className="w-4 h-4 mr-2" />
                              Move to Wishlist
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item._id)}
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-4">Add some books to your cart to get started.</p>
                        <Button onClick={() => navigate('/browse')}>
                          Browse Books
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cart Summary */}
            {activeTab === 'cart' && cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cart Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="font-medium">₹{getTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{getTotalPrice()}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/checkout')}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Abandoned Cart Reminder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BellIcon className="w-5 h-5 mr-2" />
                  Cart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Get notified when items in your cart are running low on stock or when prices drop.
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Enable Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BookmarkIcon className="w-4 h-4 mr-2" />
                    Save for Later
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Share Wishlist
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <StarIcon className="w-4 h-4 mr-2" />
                    Rate Books
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 
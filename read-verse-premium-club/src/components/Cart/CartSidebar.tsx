import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XMarkIcon, ShoppingBagIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleCart } from '@/store/slices/cartSlice';
import { fetchCart, removeFromCartAsync, clearCart } from '@/store/slices/cartSlice';
import { authFetch } from '@/lib/api';

const CartSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isOpen, total, loading, error } = useAppSelector((state) => state.cart);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCart());
    }
  }, [isOpen, dispatch]);

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCartAsync(id));
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    dispatch(toggleCart()); // Close cart sidebar
    navigate('/checkout'); // Navigate to checkout page
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50" 
        onClick={() => dispatch(toggleCart())}
      />
      {/* Sidebar */}
      <div className="w-full max-w-md bg-background shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5" />
            Shopping Cart
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleCart())}
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* asijsdfj */}
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p>Loading cart...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {items.length === 0 && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center space-x-3 p-3 bg-card rounded-lg border"
                >
                  <div className="relative w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded overflow-hidden">
                    {/* Loading State */}
                    {imageLoading[book.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    {/* Image */}
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        imageLoading[book.id] ? 'opacity-0' : 'opacity-100'
                      }`}
                      onLoad={() => {
                        setImageLoading(prev => ({ ...prev, [book.id]: false }));
                        setImageErrors(prev => ({ ...prev, [book.id]: false }));
                      }}
                      onError={() => {
                        setImageErrors(prev => ({ ...prev, [book.id]: true }));
                        setImageLoading(prev => ({ ...prev, [book.id]: false }));
                      }}
                      style={{
                        objectPosition: 'center',
                        minHeight: '80px'
                      }}
                    />
                    
                    {/* Error State */}
                    {imageErrors[book.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <BookOpenIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">No Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      by {book.author}
                    </p>
                    <span className="font-semibold text-primary">
                    ₹{typeof book.price === 'number' ? book.price.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem(book.id)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="border-t border-border p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
          <Button 
            className="w-full" 
            variant="hero"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
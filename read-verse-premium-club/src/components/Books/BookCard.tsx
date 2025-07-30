import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpenIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    description: string;
    coverImage?: string;
    price: number;
    isPremium?: boolean;
    rating?: number;
    tags?: string[];
  };
  onAddToCart?: (book: any, e: React.MouseEvent) => void;
  onRead?: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onAddToCart, onRead }) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(book, e);
    }
  };

  const handleRead = () => {
    if (onRead) {
      onRead(book.id);
    }
  };

  // Convert image URL to WebP format if possible
  const getOptimizedImageUrl = (originalUrl: string) => {
    if (!originalUrl) return null;
    
    // If it's already a WebP image, return as is
    if (originalUrl.includes('.webp')) return originalUrl;
    
    // If it's a placeholder or external URL, return as is
    if (originalUrl.includes('/api/placeholder/') || originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // For local images, try to use WebP version
    const baseUrl = originalUrl.split('.')[0];
    return `${baseUrl}.webp`;
  };

  const optimizedImageUrl = book.coverImage ? getOptimizedImageUrl(book.coverImage) : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200">
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {optimizedImageUrl ? (
          <picture>
            {/* WebP format for modern browsers */}
            <source srcSet={optimizedImageUrl} type="image/webp" />
            {/* Fallback to original format */}
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                console.log('🔍 Image failed to load for:', book.title);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpenIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
        {book.isPremium && (
          <Badge className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg text-xs">
            Premium
          </Badge>
        )}
      </div>
      <CardContent className="p-2">
        <h3 className="font-semibold text-sm mb-1 text-gray-900 line-clamp-1">{book.title}</h3>
        <p className="text-gray-600 text-xs mb-1">by {book.author}</p>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{book.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm font-bold text-primary">
            {book.price === 0 ? 'Free' : `$${book.price}`}
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleAddToCart}
              className="h-6 px-2 text-xs"
            >
              <ShoppingCartIcon className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              className="flex items-center gap-1 h-6 px-2 text-xs"
              onClick={handleRead}
            >
              <BookOpenIcon className="h-3 w-3" />
              Read
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
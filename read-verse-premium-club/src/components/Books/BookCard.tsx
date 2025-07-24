import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { Book } from '@/store/slices/booksSlice';
import { useAppDispatch } from '@/store';
import { addToCartAsync } from '@/store/slices/cartSlice';

interface BookCardProps {
  book: Book;
  onViewDetails?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onViewDetails }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addToCartAsync(book.id));
  };

  const handleViewDetails = () => {
    onViewDetails?.(book);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-4 w-4 text-accent" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-accent opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarOutlineIcon key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  return (
    <Card className="group cursor-pointer overflow-hidden bg-gradient-book hover:shadow-book transition-all duration-300 hover:-translate-y-1">
      <div className="relative" onClick={handleViewDetails}>
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {book.isPremium && (
            <Badge className="absolute top-2 right-2 bg-gradient-premium text-foreground border-0">
              Premium
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-muted-foreground text-sm">by {book.author}</p>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {book.description}
        </p>
        
        <div className="flex items-center space-x-1">
          {renderStars(book.rating)}
          <span className="text-sm text-muted-foreground ml-2">
            ({book.totalReviews})
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {book.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xl font-bold text-primary">
          ${book.price.toFixed(2)}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="cart" size="sm" onClick={handleAddToCart}>
            <ShoppingCartIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookCard;
import React from 'react';
import BookCard from './BookCard';
import { Book } from '@/store/slices/booksSlice';

interface BookGridProps {
  books: Book[];
  onBookSelect?: (book: Book) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onBookSelect }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No books found</div>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onViewDetails={onBookSelect}
        />
      ))}
    </div>
  );
};

export default BookGrid;
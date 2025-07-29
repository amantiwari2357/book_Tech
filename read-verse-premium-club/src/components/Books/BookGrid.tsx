import React from 'react';
import BookCard from './BookCard';
import { Book } from '@/store/slices/booksSlice';

interface BookGridProps {
  books: Book[];
  onBookSelect?: (book: Book) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onBookSelect }) => {
  if (books.length === 0) {
    return null; // Return null instead of showing empty state message
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
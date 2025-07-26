import React from 'react';
import { useParams } from 'react-router-dom';
import EBookReader from '@/components/Reader/EBookReader';
import { useAppSelector } from '@/store';

const Reader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books } = useAppSelector((state) => state.books);
  
  const book = books.find(b => b.id === id);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <p className="text-muted-foreground">The book you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <EBookReader
      bookId={book.id}
      title={book.title}
      author={book.author}
      isPremium={book.isPremium}
      content={book.description}
    />
  );
};

export default Reader;
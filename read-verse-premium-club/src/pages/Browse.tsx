import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BookGrid from '@/components/Books/BookGrid';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSearchTerm, setSelectedCategory, fetchBooks } from '@/store/slices/booksSlice';

const Browse: React.FC = () => {
  const dispatch = useAppDispatch();
  const { books, searchTerm, selectedCategory, loading, error } = useAppSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const categories = ['All', 'Technology', 'Business', 'Science', 'Fiction', 'Non-Fiction'];

  const filteredBooks = useMemo(() => {
    let filtered = books;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filtered;
  }, [books, searchTerm, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search books, authors, tags..."
            value={searchTerm}
            onChange={e => dispatch(setSearchTerm(e.target.value))}
            className="max-w-xs"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => dispatch(setSelectedCategory(category))}
              className="cursor-pointer"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
      {loading && <p>Loading books...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <BookGrid books={filteredBooks} />
    </div>
  );
};

export default Browse;
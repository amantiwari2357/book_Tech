import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
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
      <Helmet>
        <title>Browse Books - BookTech Digital Library</title>
        <meta name="description" content="Browse and search through thousands of premium books across all categories. Find your next great read with our advanced search and filtering options." />
        <meta name="keywords" content="browse books, search books, digital library, premium books, book categories" />
        <link rel="canonical" href="https://booktech.com/browse" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Browse Books - BookTech Digital Library" />
        <meta property="og:description" content="Browse and search through thousands of premium books across all categories." />
        <meta property="og:url" content="https://booktech.com/browse" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta property="twitter:title" content="Browse Books - BookTech Digital Library" />
        <meta property="twitter:description" content="Browse and search through thousands of premium books across all categories." />
        <meta property="twitter:url" content="https://booktech.com/browse" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Browse Books",
            "description": "Browse and search through thousands of premium books",
            "url": "https://booktech.com/browse",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": books.length,
              "itemListElement": books.slice(0, 10).map((book, index) => ({
                "@type": "Book",
                "position": index + 1,
                "name": book.title,
                "author": book.author,
                "description": book.description
              }))
            }
          })}
        </script>
      </Helmet>
      
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
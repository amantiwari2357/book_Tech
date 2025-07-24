import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import BookGrid from '@/components/Books/BookGrid';
import { useAppSelector } from '@/store';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon,
  FireIcon,
  StarIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Categories: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { books } = useAppSelector((state) => state.books);

  const categories = [
    { id: 'all', name: 'All Books', icon: BookOpenIcon, count: books.length, color: 'bg-primary' },
    { id: 'new-releases', name: 'New Releases', icon: StarIcon, count: 8, color: 'bg-green-500' },
    { id: 'bestsellers', name: 'Bestsellers', icon: FireIcon, count: 12, color: 'bg-red-500' },
    { id: 'trending', name: 'Trending', icon: ArrowTrendingUpIcon, count: 6, color: 'bg-orange-500' },
    { id: 'recently-added', name: 'Recently Added', icon: ClockIcon, count: 4, color: 'bg-blue-500' },
    { id: 'fiction', name: 'Fiction', icon: BookOpenIcon, count: 24, color: 'bg-purple-500' },
    { id: 'non-fiction', name: 'Non-Fiction', icon: BookOpenIcon, count: 18, color: 'bg-indigo-500' },
    { id: 'science', name: 'Science & Technology', icon: BookOpenIcon, count: 15, color: 'bg-cyan-500' },
    { id: 'business', name: 'Business', icon: BookOpenIcon, count: 12, color: 'bg-yellow-500' },
    { id: 'history', name: 'History', icon: BookOpenIcon, count: 10, color: 'bg-gray-500' },
    { id: 'self-help', name: 'Self Help', icon: BookOpenIcon, count: 14, color: 'bg-pink-500' },
    { id: 'romance', name: 'Romance', icon: BookOpenIcon, count: 16, color: 'bg-rose-500' },
  ];

  const featuredCollections = [
    {
      title: 'Editor\'s Choice',
      description: 'Handpicked books by our editorial team',
      books: books.slice(0, 4),
      badge: 'Featured'
    },
    {
      title: 'Staff Picks',
      description: 'Recommended by our reading enthusiasts',
      books: books.slice(4, 8),
      badge: 'Popular'
    },
    {
      title: 'Award Winners',
      description: 'Books that have won prestigious awards',
      books: books.slice(8, 12),
      badge: 'Award'
    }
  ];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'new-releases') return matchesSearch; // Will be filtered by date when backend is connected
    if (selectedCategory === 'bestsellers') return matchesSearch; // Will be filtered by sales when backend is connected
    // Add more category filtering logic here
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Explore Our Library
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover thousands of books across all genres and categories
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories, books, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} books</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Featured Collections */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Featured Collections</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCollections.map((collection, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{collection.title}</CardTitle>
                    <Badge variant="secondary">{collection.badge}</Badge>
                  </div>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {collection.books.map((book) => (
                      <Link key={book.id} to={`/book/${book.id}`} className="group">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                        />
                      </Link>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/collection/${collection.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      View Collection
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Books Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              {selectedCategory === 'all' ? 'All Books' : 
               categories.find(c => c.id === selectedCategory)?.name || 'Books'}
            </h2>
            <div className="text-sm text-muted-foreground">
              {filteredBooks.length} books found
            </div>
          </div>
          
          {filteredBooks.length > 0 ? (
            <BookGrid books={filteredBooks} />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No books found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or browse a different category
                </p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                  Browse All Books
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default Categories;
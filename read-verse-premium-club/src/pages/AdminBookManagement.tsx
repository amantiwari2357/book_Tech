import React, { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Book {
  _id: string;
  title: string;
  author: string;
  isRecommended: boolean;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  price: number;
  isPremium: boolean;
  coverImage?: string;
}

const AdminBookManagement: React.FC = () => {
  const [approvedBooks, setApprovedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'recommended' | 'featured'>('all');

  useEffect(() => {
    fetchApprovedBooks();
  }, []);

  const fetchApprovedBooks = async () => {
    try {
      const res = await authFetch('/books');
      if (res.ok) {
        const data = await res.json();
        setApprovedBooks(data);
      }
    } catch (error) {
      console.error('Error fetching approved books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRecommended = async (bookId: string) => {
    try {
      const res = await authFetch(`/books/admin/toggle-recommended/${bookId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setApprovedBooks(books => 
          books.map(book => 
            book._id === bookId 
              ? { ...book, isRecommended: data.isRecommended }
              : book
          )
        );
      }
    } catch (error) {
      console.error('Error toggling recommended status:', error);
    }
  };

  const handleToggleFeatured = async (bookId: string) => {
    try {
      const res = await authFetch(`/books/admin/toggle-featured/${bookId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setApprovedBooks(books => 
          books.map(book => 
            book._id === bookId 
              ? { ...book, isFeatured: data.isFeatured }
              : book
          )
        );
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400 opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarOutlineIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const filteredBooks = approvedBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                         book.author.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'recommended') return matchesSearch && book.isRecommended;
    if (filter === 'featured') return matchesSearch && book.isFeatured;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Book Management</h1>
        <p className="text-gray-600 mb-6">Manage recommended and featured books for your platform.</p>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'recommended' | 'featured')}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Books</option>
            <option value="recommended">Recommended Only</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Total Books</h3>
            <p className="text-2xl font-bold text-primary">{approvedBooks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Recommended</h3>
            <p className="text-2xl font-bold text-green-600">{approvedBooks.filter(b => b.isRecommended).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Featured</h3>
            <p className="text-2xl font-bold text-blue-600">{approvedBooks.filter(b => b.isFeatured).length}</p>
          </div>
        </div>
      </div>

      {/* Books List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <div key={book._id} className="bg-white rounded-lg shadow-lg border overflow-hidden hover:shadow-xl transition-shadow">
            {/* Book Cover */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">No Cover</p>
                  </div>
                </div>
              )}
              {book.isPremium && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  Premium
                </Badge>
              )}
            </div>

            {/* Book Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {renderStars(book.rating)}
                <span className="text-sm text-gray-500 ml-1">({book.totalReviews})</span>
              </div>

              {/* Price */}
              <p className="text-lg font-bold text-primary mb-4">${book.price.toFixed(2)}</p>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {book.isRecommended && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Recommended
                  </Badge>
                )}
                {book.isFeatured && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={book.isRecommended ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleRecommended(book._id)}
                  className={book.isRecommended ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {book.isRecommended ? "Remove from Recommended" : "Add to Recommended"}
                </Button>
                <Button
                  variant={book.isFeatured ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFeatured(book._id)}
                  className={book.isFeatured ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {book.isFeatured ? "Remove from Featured" : "Add to Featured"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminBookManagement; 
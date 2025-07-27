import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/api';
import { useAppSelector } from '@/store';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeftIcon, 
  ShoppingCartIcon, 
  EyeIcon, 
  BookOpenIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface BookDesign {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  content: string;
  formatting: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    textColor: string;
    backgroundColor: string;
    pageWidth: number;
    pageHeight: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  category: string;
  tags: string[];
  isFree: boolean;
  price: number;
  isPremium: boolean;
  status: 'pending' | 'approved' | 'rejected';
  readCount: number;
  purchaseCount: number;
  authorRef: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const BookDesignReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [bookDesign, setBookDesign] = useState<BookDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (id) {
      fetchBookDesign();
    }
  }, [id]);

  const fetchBookDesign = async () => {
    try {
      const res = await authFetch(`/book-designs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBookDesign(data);
        
        // Calculate total pages based on content length
        const wordsPerPage = 250; // Average words per page
        const words = data.content.split(' ').length;
        setTotalPages(Math.ceil(words / wordsPerPage));
        
        // Increment read count
        await authFetch(`/book-designs/${id}/read`, { method: 'POST' });
      } else {
        setError('Book not found');
      }
    } catch (error) {
      setError('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase this book",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await authFetch(`/book-designs/${id}/purchase`, {
        method: 'POST'
      });

      if (res.ok) {
        toast({
          title: "Purchase Successful",
          description: "You can now read the full book"
        });
        setShowFullContent(true);
      } else {
        const error = await res.json();
        toast({
          title: "Purchase Failed",
          description: error.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = () => {
    // Add to cart functionality
    toast({
      title: "Added to Cart",
      description: "Book added to your cart"
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from Favorites" : "Added to Favorites",
      description: isLiked ? "Book removed from your favorites" : "Book added to your favorites"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bookDesign?.title,
        text: bookDesign?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Book link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !bookDesign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (bookDesign.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book Not Available</h1>
          <p className="text-gray-600 mb-4">This book is not yet approved for reading.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="flex items-center gap-1"
              >
                {isLiked ? (
                  <HeartIconSolid className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <ShareIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                {/* Cover Image */}
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-6">
                  {bookDesign.coverImageUrl ? (
                    <img
                      src={bookDesign.coverImageUrl}
                      alt={bookDesign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpenIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{bookDesign.title}</h1>
                    <p className="text-gray-600">by {bookDesign.author}</p>
                  </div>

                  <p className="text-gray-700">{bookDesign.description}</p>

                  {/* Tags */}
                  {bookDesign.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {bookDesign.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{bookDesign.readCount} reads</span>
                    <span>{bookDesign.purchaseCount} purchases</span>
                  </div>

                  {/* Price/Action */}
                  <div className="border-t pt-4">
                    {bookDesign.isFree ? (
                      <div className="text-center">
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          Free to Read
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-center">
                          <span className="text-2xl font-bold">${bookDesign.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            onClick={handlePurchase}
                          >
                            Purchase
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleAddToCart}
                          >
                            <ShoppingCartIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {/* Reading Controls */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFullContent(!showFullContent)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {showFullContent ? 'Show Preview' : 'Show Full Content'}
                  </Button>
                </div>

                {/* Book Content */}
                <div 
                  className="prose max-w-none"
                  style={{
                    backgroundColor: bookDesign.formatting.backgroundColor,
                    color: bookDesign.formatting.textColor,
                    fontFamily: bookDesign.formatting.fontFamily,
                    fontSize: `${bookDesign.formatting.fontSize}px`,
                    lineHeight: bookDesign.formatting.lineHeight,
                    padding: `${bookDesign.formatting.margins.top}in ${bookDesign.formatting.margins.right}in ${bookDesign.formatting.margins.bottom}in ${bookDesign.formatting.margins.left}in`,
                    minHeight: `${bookDesign.formatting.pageHeight * 100}px`,
                    width: `${bookDesign.formatting.pageWidth * 100}px`,
                    margin: '0 auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {showFullContent || bookDesign.isFree ? (
                    <div>
                      <h1 className="text-3xl font-bold mb-4">{bookDesign.title}</h1>
                      <p className="text-lg mb-8">by {bookDesign.author}</p>
                      <div className="whitespace-pre-wrap">
                        {bookDesign.content}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold mb-4">{bookDesign.title}</h1>
                      <p className="text-lg mb-8">by {bookDesign.author}</p>
                      <div className="whitespace-pre-wrap">
                        {bookDesign.content.substring(0, 500)}...
                      </div>
                      <div className="mt-8 text-center">
                        <div className="bg-gray-100 rounded-lg p-6">
                          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Continue Reading</h3>
                          <p className="text-gray-600 mb-4">
                            Purchase this book to read the full content
                          </p>
                          <Button onClick={handlePurchase}>
                            Purchase for ${bookDesign.price}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDesignReader; 
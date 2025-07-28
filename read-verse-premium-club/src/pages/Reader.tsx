import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/api';
import { useAppSelector } from '@/store';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeftIcon, 
  BookOpenIcon,
  EyeIcon,
  ShoppingCartIcon,
  HeartIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface BookContent {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  coverImageUrl?: string;
  content?: string;
  isPremium: boolean;
  price: number;
  isFree?: boolean;
  status: string;
  authorRef?: {
    _id: string;
    name: string;
  };
  formatting?: {
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
}

const Reader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (id) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        setShowLoginPrompt(true);
        setLoading(false);
        return;
      }
      fetchBookContent();
    }
  }, [id, isAuthenticated]);

  const handleLoginRedirect = () => {
    // Save the current book ID in localStorage so we can redirect back after login
    localStorage.setItem('redirectAfterLogin', `/reader/${id}`);
    navigate('/login');
  };

  const handleSignupRedirect = () => {
    // Save the current book ID in localStorage so we can redirect back after signup
    localStorage.setItem('redirectAfterLogin', `/reader/${id}`);
    navigate('/signup');
  };

  const fetchBookContent = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching book content for ID:', id);
      console.log('Is authenticated:', isAuthenticated);
      
      // First try to fetch as a book design
      let res;
      if (isAuthenticated) {
        // Use authFetch when authenticated
        console.log('Using authFetch for book design');
        res = await authFetch(`/book-designs/${id}`);
      } else {
        // Use regular fetch when not authenticated
        console.log('Using regular fetch for book design');
        res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/book-designs/${id}`);
      }
      
      console.log('Book design response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Book design data:', data);
        
        if (data.status === 'approved') {
          setBookContent(data);
          // Calculate total pages based on content length
          const wordsPerPage = 250;
          const words = data.content?.split(' ').length || 0;
          setTotalPages(Math.ceil(words / wordsPerPage));
          
          // Increment read count (only if authenticated)
          if (isAuthenticated) {
            try {
              await authFetch(`/book-designs/${id}/read`, { method: 'POST' });
            } catch (error) {
              console.log('Could not increment read count (not authenticated)');
            }
          }
          return;
        } else {
          setError('This book design is not yet approved for reading.');
          return;
        }
      } else {
        console.log('Book design fetch failed, trying regular book');
      }

      // If not a book design, try as a regular book
      if (isAuthenticated) {
        console.log('Using authFetch for regular book');
        res = await authFetch(`/books/${id}`);
      } else {
        console.log('Using regular fetch for regular book');
        res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/books/${id}`);
      }
      
      console.log('Regular book response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Regular book data:', data);
        
        if (data.status === 'approved') {
          // For regular books, we'll show the description as content
          // since they don't have full content
          setBookContent({
            ...data,
            content: data.description || 'Content not available for this book.',
            isFree: data.price === 0
          });
          setTotalPages(1); // Regular books don't have multiple pages
          return;
        } else {
          setError('This book is not yet approved for reading.');
          return;
        }
      }

      setError('Book not found');
    } catch (error) {
      console.error('Error fetching book content:', error);
      setError('Failed to load book content');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <LockClosedIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
            <p className="text-gray-600 mb-4">
              Please login or create an account to read this book
            </p>
            <p className="text-sm text-gray-500">
              After login, you'll be automatically redirected back to this book
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleLoginRedirect}
              className="w-full"
              size="lg"
            >
              Login to Continue
            </Button>
            
            <Button 
              onClick={handleSignupRedirect}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Create New Account
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full"
            >
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bookContent) {
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

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{bookContent.title}</h1>
              <p className="text-sm text-gray-600">by {bookContent.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLike}>
              {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleAddToCart}>
              <ShoppingCartIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
                  {bookContent.coverImageUrl ? (
                    <img
                      src={bookContent.coverImageUrl}
                      alt={bookContent.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpenIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">{bookContent.title}</h2>
                    <p className="text-gray-600">by {bookContent.author}</p>
                  </div>
                  
                  <p className="text-sm text-gray-700">{bookContent.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={bookContent.isFree ? "default" : "secondary"}>
                      {bookContent.isFree ? "Free" : `$${bookContent.price}`}
                    </Badge>
                    {bookContent.isPremium && (
                      <Badge variant="outline">Premium</Badge>
                    )}
                  </div>
                  
                  {!bookContent.isFree && !showFullContent && (
                    <div className="space-y-2">
                      <Button onClick={handlePurchase} className="w-full">
                        Purchase to Read Full Content
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Preview available below
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div 
                  className="prose max-w-none"
                  style={{
                    backgroundColor: bookContent.formatting?.backgroundColor || '#ffffff',
                    color: bookContent.formatting?.textColor || '#000000',
                    fontFamily: bookContent.formatting?.fontFamily || 'Arial',
                    fontSize: `${bookContent.formatting?.fontSize || 16}px`,
                    lineHeight: bookContent.formatting?.lineHeight || 1.5,
                    padding: `${bookContent.formatting?.margins?.top || 0.5}in ${bookContent.formatting?.margins?.right || 0.75}in ${bookContent.formatting?.margins?.bottom || 0.5}in ${bookContent.formatting?.margins?.left || 0.75}in`,
                  }}
                >
                  <h1 className="text-2xl font-bold mb-4">{bookContent.title}</h1>
                  <p className="text-sm text-gray-600 mb-6">by {bookContent.author}</p>
                  
                  <div className="whitespace-pre-wrap">
                    {bookContent.isFree || showFullContent 
                      ? bookContent.content 
                      : bookContent.content?.substring(0, 500) + '...'
                    }
                  </div>
                  
                  {!bookContent.isFree && !showFullContent && bookContent.content && bookContent.content.length > 500 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        This is a preview. Purchase the book to read the full content.
                      </p>
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

export default Reader;
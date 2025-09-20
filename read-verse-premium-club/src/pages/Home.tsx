import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookGrid from '@/components/Books/BookGrid';
import PricingSection from '@/components/Subscription/PricingSection';
import SocialShare from '@/components/ui/social-share';
import { ArrowRightIcon, BookOpenIcon, StarIcon, UsersIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { setFeaturedBooks, fetchBooks } from '@/store/slices/booksSlice';
import { addToCartAsync } from '@/store/slices/cartSlice';
import { authFetch } from '@/lib/api';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { toast } from '@/hooks/use-toast';

// Helper: Get user's favorite category (most orders or most books)
function getFavoriteCategory(user, books) {
  if (!user || !user.orders || !books.length) return null;
  const catCount = {};
  user.orders.forEach(o => {
    const book = books.find(b => b.id === (typeof o.book === "object" ? o.book._id : o.book));
    if (book && book.category) catCount[book.category] = (catCount[book.category] || 0) + 1;
  });
  const sorted = Object.entries(catCount).sort((a, b) => (b[1] as number) - (a[1] as number));
  return sorted.length ? sorted[0][0] : null;
}

// Helper: Get books in progress (mock: random 2 books for now)
function getBooksInProgress(user, books) {
  // Replace with real reading progress logic if available
  if (!user || !books.length) return [];
  return books.slice(3, 5);
}

// Helper: Get trending/new releases in favorite category
function getTrendingInCategory(category, books) {
  if (!category) return [];
  return books.filter(b => b.category === category).slice(0, 3);
}

// Helper: 'Because You Read...' (mock: similar to top-rated book)
function getBecauseYouRead(user, books) {
  if (!user || !user.orders || !books.length) return [];
  // Find top-rated book user ordered
  const orderedBooks = user.orders.map(o => books.find(b => b.id === (typeof o.book === "object" ? o.book._id : o.book))).filter(Boolean);
  const topBook = orderedBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  if (!topBook) return [];
  // Recommend books in same category/genre
  return books.filter(b => b.id !== topBook.id && (b.category === topBook.category || b.genre === topBook.genre)).slice(0, 3);
}

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { books, featuredBooks, loading, error } = useAppSelector((state) => state.books);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [featuredBooksFromAPI, setFeaturedBooksFromAPI] = useState([]);
  const [bookDesigns, setBookDesigns] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedBookDesign, setSelectedBookDesign] = useState(null);
  const [bookDesignsLoaded, setBookDesignsLoaded] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Cart functionality
  const handleAddToCart = async (book: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    try {
      await dispatch(addToCartAsync(book.id)).unwrap();
      toast({
        title: "Added to Cart",
        description: `${book.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Intersection observer for lazy loading book designs
  const { elementRef: bookDesignsTriggerRef, hasTriggered: bookDesignsTriggered } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  // Scroll animation hooks
  const { elementRef: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { elementRef: statsRef, isVisible: statsVisible } = useScrollAnimation();
  const { elementRef: featuredRef, isVisible: featuredVisible } = useScrollAnimation();
  const { elementRef: recommendedRef, isVisible: recommendedVisible } = useScrollAnimation();
  const { elementRef: bookDesignsRef, isVisible: bookDesignsVisible } = useScrollAnimation();
  const { elementRef: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { elementRef: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  // Fetch books with retry mechanism
  useEffect(() => {
    const fetchBooksWithRetry = async () => {
      try {
        await dispatch(fetchBooks()).unwrap();
      } catch (error) {
        console.error('Failed to fetch books:', error);
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            dispatch(fetchBooks());
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      }
    };

    fetchBooksWithRetry();
  }, [dispatch, retryCount]);

  useEffect(() => {
    if (books.length > 0) {
      dispatch(setFeaturedBooks(books.slice(0, 3)));
    }
  }, [books, dispatch]);

  // Fetch recommended and featured books from API
  useEffect(() => {
    setApiLoading(true);
    
    const fetchRecommendedBooks = async () => {
      try {
        const res = await authFetch('/books/recommended/list');
        if (res.ok) {
          const data = await res.json();
          setRecommendedBooks(data);
        } else {
          console.error('Failed to fetch recommended books:', res.status);
        }
      } catch (error) {
        console.error('Error fetching recommended books:', error);
      }
    };

    const fetchFeaturedBooks = async () => {
      try {
        const res = await authFetch('/books/featured/list');
        if (res.ok) {
          const data = await res.json();
          setFeaturedBooksFromAPI(data);
        } else {
          console.error('Failed to fetch featured books:', res.status);
        }
      } catch (error) {
        console.error('Error fetching featured books:', error);
      }
    };

    // Fetch all data with error handling
    Promise.allSettled([
      fetchRecommendedBooks(),
      fetchFeaturedBooks()
    ]).then((results) => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`API call ${index} failed:`, result.reason);
        }
      });
      setApiLoading(false);
    });
  }, []);

  // Lazy load book designs when section becomes visible
  useEffect(() => {
    if (bookDesignsTriggered && !bookDesignsLoaded) {
      const fetchBookDesigns = async () => {
        try {
          console.log('🔍 Lazy loading book designs...');
          const res = await authFetch('/book-designs');
          if (res.ok) {
            const data = await res.json();
            console.log('🔍 Book designs loaded:', data.length);
            setBookDesigns(data);
            setBookDesignsLoaded(true);
          } else {
            console.error('❌ Failed to fetch book designs:', res.status);
          }
        } catch (error) {
          console.error('❌ Error fetching book designs:', error);
        }
      };

      fetchBookDesigns();
    }
  }, [bookDesignsTriggered, bookDesignsLoaded]);

  // Determine user subscription status
  const isPremium = user?.subscription === 'premium' || user?.subscription === 'enterprise';

  // Legacy recommended books logic (keeping for fallback)
  const legacyRecommendedBooks = isAuthenticated
    ? [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
    : [];

  const favoriteCategory = isAuthenticated ? getFavoriteCategory(user, books) : null;
  const booksInProgress = isAuthenticated ? getBooksInProgress(user, books) : [];
  const trendingInCategory = isAuthenticated ? getTrendingInCategory(favoriteCategory, books) : [];
  const becauseYouRead = isAuthenticated ? getBecauseYouRead(user, books) : [];

  // Check if there's any content to show
  const hasAnyContent = books.length > 0 || 
                       featuredBooks.length > 0 || 
                       recommendedBooks.length > 0 || 
                       featuredBooksFromAPI.length > 0 || 
                       bookDesigns.length > 0 ||
                       booksInProgress.length > 0 ||
                       trendingInCategory.length > 0 ||
                       becauseYouRead.length > 0;

  // Handler for Start Reading button
  const handleStartReading = () => {
    if (!isAuthenticated) {
      navigate('/signup');
    } else if (isPremium) {
      if (user.role === 'customer') navigate('/customer-dashboard');
      else if (user.role === 'author') navigate('/author-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/browse');
    } else {
      navigate('/subscriptions');
    }
  };

  // Handler for Browse Library
  const handleBrowseLibrary = () => {
    navigate('/browse');
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>BookTech - Your Digital Library | Premium Books & Custom Designs</title>
        <meta name="description" content="Discover thousands of premium books, enjoy seamless reading experiences, and unlock knowledge with our advanced digital platform. Custom book designs with beautiful formatting." />
        <meta name="keywords" content="digital books, premium reading, book designs, custom formatting, online library, ebooks, digital reading" />
        <meta name="author" content="BookTech" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://booktech.com/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://booktech.com/" />
        <meta property="og:title" content="BookTech - Your Digital Library" />
        <meta property="og:description" content="Discover thousands of premium books, enjoy seamless reading experiences, and unlock knowledge with our advanced digital platform." />
        <meta property="og:image" content="https://booktech.com/og-image.jpg" />
        <meta property="og:site_name" content="BookTech" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://booktech.com/" />
        <meta property="twitter:title" content="BookTech - Your Digital Library" />
        <meta property="twitter:description" content="Discover thousands of premium books, enjoy seamless reading experiences, and unlock knowledge with our advanced digital platform." />
        <meta property="twitter:image" content="https://booktech.com/twitter-image.jpg" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "BookTech",
            "description": "Your Digital Library - Discover thousands of premium books and custom book designs",
            "url": "https://booktech.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://booktech.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "BookTech",
              "logo": {
                "@type": "ImageObject",
                "url": "https://booktech.com/logo.png"
              }
            }
          })}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section ref={heroRef} className={`relative bg-gradient-hero text-primary-foreground py-16 sm:py-20 overflow-hidden ${heroVisible ? 'fade-in-bounce animate-in' : 'fade-in-bounce'}`}>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 text-center">
          {isAuthenticated && (
            <div className="mb-4 text-lg font-semibold">
              Welcome back, <span className="text-accent">{user?.name}</span>!
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Your Digital
            <br />
            <span className="text-accent">Library</span> Awaits
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Discover thousands of premium books, enjoy seamless reading experiences, 
            and unlock knowledge with our advanced digital platform. From classic literature 
            to contemporary bestsellers, our extensive collection caters to every reader's taste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant={isPremium ? 'default' : 'premium'}
              size="lg"
              className="text-lg px-8 py-4 relative mobile-button"
              onClick={handleStartReading}
            >
              {isAuthenticated
                ? isPremium
                  ? 'Continue Reading'
                  : 'Upgrade to Premium'
                : 'Start Reading Free'}
              <ArrowRightIcon className="h-5 w-5 ml-2" />
              {!isAuthenticated && (
                <Badge className="ml-2 bg-green-500 text-white">Free</Badge>
              )}
              {isAuthenticated && !isPremium && (
                <Badge className="ml-2 bg-yellow-500 text-white">Upgrade</Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-primary text-white border-2 border-primary hover:bg-primary/90 hover:text-white relative mobile-button font-semibold shadow-lg"
              onClick={handleBrowseLibrary}
              title={!isAuthenticated ? 'Sign up for more features!' : !isPremium ? 'Upgrade for premium content' : 'Browse all books'}
            >
              Browse Library
              <ArrowRightIcon className="h-4 w-4 ml-2" />
              {!isAuthenticated && (
                <Badge className="ml-2 bg-blue-500 text-white">Guest</Badge>
              )}
              {isAuthenticated && !isPremium && (
                <Badge className="ml-2 bg-yellow-500 text-white">Limited</Badge>
              )}
            </Button>
          </div>
          
          {/* Social Share Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-primary-foreground/80 mb-4">
              Share BookTech with your friends and family
            </p>
            <SocialShare 
              title="BookTech - Your Premium Digital Library"
              description="Discover thousands of premium books and enjoy seamless reading experiences."
              hashtags={['BookTech', 'DigitalLibrary', 'Reading', 'Books']}
              className="justify-center"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className={`py-16 bg-background ${statsVisible ? 'fade-in-up animate-in' : 'fade-in-up'}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
            Why Choose BookTech?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">10,000+ Books</h3>
              <p className="text-muted-foreground">
                Access a vast collection of books across all genres, from fiction to non-fiction, 
                academic to entertainment. Our library is constantly growing with new releases and classics.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">50,000+ Readers</h3>
              <p className="text-muted-foreground">
                Join our thriving community of readers who trust BookTech for their digital reading needs. 
                Connect with fellow book lovers and discover new favorites.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Experience</h3>
              <p className="text-muted-foreground">
                Enjoy an ad-free reading experience with advanced features like offline reading, 
                custom bookmarks, and personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books - Only show if there are featured books */}
      {featuredBooks.length > 0 && (
        <section ref={featuredRef} className={`py-12 sm:py-16 bg-background ${featuredVisible ? 'slide-in-left animate-in' : 'slide-in-left'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2 mobile-text-gradient">Featured Books</h2>
                <p className="text-muted-foreground">Discover our most popular and trending titles, carefully curated for your reading pleasure</p>
              </div>
              <Button variant="outline" className="mobile-button" onClick={() => navigate('/browse')}>
                View All Books
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {loading && <p>Loading books...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {featuredBooks.slice(0, 5).map((book, index) => (
                <div 
                  key={book.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200" 
                  style={{ minHeight: '280px' }}
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('🔍 Image failed to load for:', book.title);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {book.isPremium && (
                      <Badge className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1 text-gray-900 line-clamp-1">{book.title}</h3>
                    <p className="text-gray-600 text-xs mb-1">by {book.author}</p>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{book.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-bold text-primary">
                        {book.price === 0 ? 'Free' : `$${book.price}`}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => handleAddToCart(book, e)}
                          className="h-6 px-2 text-xs"
                        >
                          <ShoppingCartIcon className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1 h-6 px-2 text-xs"
                          onClick={() => navigate(`/reader/${book.id}`)}
                        >
                          <BookOpenIcon className="h-3 w-3" />
                          Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section ref={featuresRef} className={`py-16 bg-muted/30 ${featuresVisible ? 'fade-in-up animate-in' : 'fade-in-up'}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
            Advanced Reading Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Offline Reading</h3>
              <p className="text-muted-foreground mb-4">
                Download your favorite books and read them anywhere, even without an internet connection. 
                Perfect for travel, commuting, or when you want to disconnect.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/subscriptions')}>
                Learn More
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <StarIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Our AI-powered recommendation system learns your reading preferences and suggests 
                books you'll love. Discover new authors and genres tailored to your taste.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/browse')}>
                Browse Books
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <UsersIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Reading Communities</h3>
              <p className="text-muted-foreground mb-4">
                Join reading groups, participate in book discussions, and connect with fellow readers. 
                Share your thoughts and discover books through community recommendations.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/categories')}>
                Explore Categories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended for You - Only show if there are recommended books */}
      {recommendedBooks.length > 0 && (
        <section ref={recommendedRef} className={`py-12 sm:py-16 bg-muted/30 ${recommendedVisible ? 'slide-in-right animate-in' : 'slide-in-right'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Recommended for You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {recommendedBooks.slice(0, 5).map((book, index) => (
                <div 
                  key={book.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200" 
                  style={{ minHeight: '280px' }}
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('🔍 Image failed to load for:', book.title);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {book.isPremium && (
                      <Badge className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1 text-gray-900 line-clamp-1">{book.title}</h3>
                    <p className="text-gray-600 text-xs mb-1">by {book.author}</p>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{book.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-bold text-primary">
                        {book.price === 0 ? 'Free' : `$${book.price}`}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => handleAddToCart(book, e)}
                          className="h-6 px-2 text-xs"
                        >
                          <ShoppingCartIcon className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1 h-6 px-2 text-xs"
                        >
                          <BookOpenIcon className="h-3 w-3" />
                          Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Books from API - Only show if there are featured books */}
      {featuredBooksFromAPI.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Featured Books</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {featuredBooksFromAPI.slice(0, 5).map((book, index) => (
                <div 
                  key={book.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200" 
                  style={{ minHeight: '280px' }}
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('🔍 Image failed to load for:', book.title);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {book.isPremium && (
                      <Badge className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1 text-gray-900 line-clamp-1">{book.title}</h3>
                    <p className="text-gray-600 text-xs mb-1">by {book.author}</p>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{book.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-bold text-primary">
                        {book.price === 0 ? 'Free' : `$${book.price}`}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => handleAddToCart(book, e)}
                          className="h-6 px-2 text-xs"
                        >
                          <ShoppingCartIcon className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1 h-6 px-2 text-xs"
                        >
                          <BookOpenIcon className="h-3 w-3" />
                          Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Book Designs Trigger for Lazy Loading */}
      <div ref={bookDesignsTriggerRef} className="h-4" />

      {/* Book Designs - Only show if there are book designs */}
      {bookDesigns.length > 0 && (
        <section ref={bookDesignsRef} className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Custom Book Designs</h2>
            <p className="text-muted-foreground mb-6">Read beautifully designed books with custom formatting.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {bookDesigns.slice(0, 5).map((design, index) => {
                console.log('🔍 Rendering book design:', design.title, design._id);
                return (
                  <div 
                    key={design._id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200" 
                    style={{ minHeight: '280px' }}
                    onClick={() => setSelectedBookDesign(design)}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {design.coverImageUrl ? (
                        <img
                          src={design.coverImageUrl}
                          alt={design.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('🔍 Image failed to load for:', design.title);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpenIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {design.isPremium && (
                        <Badge className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-sm mb-1 text-gray-900 line-clamp-1">{design.title}</h3>
                      <p className="text-gray-600 text-xs mb-1">by {design.author}</p>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{design.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-primary">
                          {design.isFree ? 'Free' : `$${design.price}`}
                        </div>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1 h-6 px-2 text-xs"
                        >
                          <BookOpenIcon className="h-3 w-3" />
                          Read
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Loading indicator for book designs */}
      {bookDesignsTriggered && !bookDesignsLoaded && bookDesigns.length === 0 && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Custom Book Designs</h2>
            <p className="text-muted-foreground mb-6">Loading beautiful book designs...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </section>
      )}

      {/* Continue Reading - Only show if user is authenticated and has books in progress */}
      {isAuthenticated && booksInProgress.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Continue Reading</h2>
            <p className="text-muted-foreground mb-4">Pick up where you left off.</p>
            <BookGrid books={booksInProgress} />
          </div>
        </section>
      )}

      {/* Trending in Category - Only show if user is authenticated and has trending books */}
      {isAuthenticated && favoriteCategory && trendingInCategory.length > 0 && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Trending in {favoriteCategory}</h2>
            <p className="text-muted-foreground mb-4">Popular and new releases in your favorite category.</p>
            <BookGrid books={trendingInCategory} />
          </div>
        </section>
      )}

      {/* Because You Read - Only show if user is authenticated and has recommendations */}
      {isAuthenticated && becauseYouRead.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Because You Read...</h2>
            <p className="text-muted-foreground mb-4">You might also like these books.</p>
            <BookGrid books={becauseYouRead} />
          </div>
        </section>
      )}

      {/* Empty State - Show when no content is available */}
      {!loading && !apiLoading && !hasAnyContent && (
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <BookOpenIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold mb-4">No Books Available</h2>
              <p className="text-muted-foreground mb-6">
                We're working on adding amazing books to our library. Check back soon!
              </p>
              <Button onClick={handleBrowseLibrary} className="mobile-button">
                Browse Library
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {(loading || apiLoading) && (
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-serif font-bold mb-4">Loading Books...</h2>
              <p className="text-muted-foreground mb-6">
                Please wait while we fetch the latest books for you.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !loading && (
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-serif font-bold mb-4">Error Loading Books</h2>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()} className="mobile-button">
                Try Again
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section - Always show */}
      <PricingSection />

      {/* Call to Action Section */}
      <section ref={ctaRef} className={`py-16 bg-gradient-hero text-primary-foreground ${ctaVisible ? 'fade-in-up animate-in' : 'fade-in-up'}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of readers who have already discovered the joy of digital reading. 
            Start with our free collection or upgrade to premium for unlimited access to our entire library.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => navigate('/browse')}
            >
              Start Reading Free
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-white text-primary border-2 border-white hover:bg-white/90"
              onClick={() => navigate('/subscriptions')}
            >
              View Premium Plans
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">
                Discover Your Next Favorite Book
              </h3>
              <p className="text-muted-foreground mb-6">
                Our extensive library includes everything from timeless classics to contemporary bestsellers. 
                Whether you're into fiction, non-fiction, science fiction, romance, or academic texts, 
                we have something for every reader.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Browse by genre, author, or popularity</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Get personalized recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Read reviews from fellow readers</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => navigate('/categories')}
              >
                Explore Categories
              </Button>
            </div>
            
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">
                Advanced Reading Features
              </h3>
              <p className="text-muted-foreground mb-6">
                Experience reading like never before with our advanced features designed to enhance 
                your reading experience and help you discover new content.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Customizable reading settings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Offline reading capability</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Progress tracking and bookmarks</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => navigate('/subscriptions')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Book Design Modal */}
      {selectedBookDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedBookDesign.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBookDesign(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </Button>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  {selectedBookDesign.coverImageUrl ? (
                    <img
                      src={selectedBookDesign.coverImageUrl}
                      alt={selectedBookDesign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpenIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-gray-600 mb-2">by {selectedBookDesign.author}</p>
                  <p className="text-gray-700 mb-4">{selectedBookDesign.description}</p>
                  
                  {selectedBookDesign.tags && selectedBookDesign.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedBookDesign.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {selectedBookDesign.isFree ? 'Free' : `$${selectedBookDesign.price}`}
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => {
                        navigate(`/reader/${selectedBookDesign._id}`);
                        setSelectedBookDesign(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <BookOpenIcon className="h-5 w-5" />
                      Start Reading
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBook(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  {selectedBook.coverImage ? (
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpenIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-gray-600 mb-2">by {selectedBook.author}</p>
                  <p className="text-gray-700 mb-4">{selectedBook.description}</p>
                  
                  {selectedBook.tags && selectedBook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedBook.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {selectedBook.price === 0 ? 'Free' : `$${selectedBook.price}`}
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => {
                        navigate(`/reader/${selectedBook.id}`);
                        setSelectedBook(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <BookOpenIcon className="h-5 w-5" />
                      Start Reading
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
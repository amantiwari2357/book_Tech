import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookGrid from '@/components/Books/BookGrid';
import PricingSection from '@/components/Subscription/PricingSection';
import { ArrowRightIcon, BookOpenIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { setFeaturedBooks, fetchBooks } from '@/store/slices/booksSlice';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '@/lib/api';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

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

  // Scroll animation hooks
  const { elementRef: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { elementRef: statsRef, isVisible: statsVisible } = useScrollAnimation();
  const { elementRef: featuredRef, isVisible: featuredVisible } = useScrollAnimation();
  const { elementRef: recommendedRef, isVisible: recommendedVisible } = useScrollAnimation();
  const { elementRef: bookDesignsRef, isVisible: bookDesignsVisible } = useScrollAnimation();
  const { elementRef: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { elementRef: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  useEffect(() => {
    if (books.length > 0) {
      dispatch(setFeaturedBooks(books.slice(0, 3)));
    }
  }, [books, dispatch]);

  // Fetch recommended and featured books from API
  useEffect(() => {
    const fetchRecommendedBooks = async () => {
      try {
        const res = await authFetch('/books/recommended/list');
        if (res.ok) {
          const data = await res.json();
          setRecommendedBooks(data);
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
        }
      } catch (error) {
        console.error('Error fetching featured books:', error);
      }
    };

    const fetchBookDesigns = async () => {
      try {
        const res = await authFetch('/book-designs');
        if (res.ok) {
          const data = await res.json();
          setBookDesigns(data);
        }
      } catch (error) {
        console.error('Error fetching book designs:', error);
      }
    };

    fetchRecommendedBooks();
    fetchFeaturedBooks();
    fetchBookDesigns();
  }, []);

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
            and unlock knowledge with our advanced digital platform.
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
              className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary relative mobile-glass"
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
        </div>
      </section>

      {/* Stats Section - Only show if there are books */}
      {books.length > 0 && (
        <section ref={statsRef} className={`py-12 sm:py-16 bg-muted/30 ${statsVisible ? 'scroll-animate animate-in' : 'scroll-animate'}`}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className={`space-y-2 mobile-card p-6 rounded-lg ${statsVisible ? 'scroll-animate-stagger animate-in' : 'scroll-animate-stagger'}`}>
                <BookOpenIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
                <h3 className="text-2xl sm:text-3xl font-bold text-primary">{books.filter(b => b.isPremium).length}+</h3>
                <p className="text-muted-foreground">Premium Books</p>
              </div>
              <div className={`space-y-2 mobile-card p-6 rounded-lg ${statsVisible ? 'scroll-animate-stagger animate-in' : 'scroll-animate-stagger'}`}>
                <UsersIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
                <h3 className="text-2xl sm:text-3xl font-bold text-primary">{books.length * 5}+</h3>
                <p className="text-muted-foreground">Happy Readers</p>
              </div>
              <div className={`space-y-2 mobile-card p-6 rounded-lg ${statsVisible ? 'scroll-animate-stagger animate-in' : 'scroll-animate-stagger'}`}>
                <StarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
                <h3 className="text-2xl sm:text-3xl font-bold text-primary">
                  {books.length > 0 ? (books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.length).toFixed(1) : '4.8'}/5
                </h3>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Books - Only show if there are featured books */}
      {featuredBooks.length > 0 && (
        <section ref={featuredRef} className={`py-12 sm:py-16 ${featuredVisible ? 'slide-in-left animate-in' : 'slide-in-left'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2 mobile-text-gradient">Featured Books</h2>
                <p className="text-muted-foreground">Discover our most popular and trending titles</p>
              </div>
              <Button variant="outline" className="mobile-button">
                View All
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {loading && <p>Loading books...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <BookGrid books={featuredBooks} />
          </div>
        </section>
      )}

      {/* Recommended for You - Only show if there are recommended books */}
      {recommendedBooks.length > 0 && (
        <section ref={recommendedRef} className={`py-12 sm:py-16 bg-muted/30 ${recommendedVisible ? 'slide-in-right animate-in' : 'slide-in-right'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Recommended for You</h2>
            <BookGrid books={recommendedBooks} />
          </div>
        </section>
      )}

      {/* Featured Books from API - Only show if there are featured books */}
      {featuredBooksFromAPI.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Featured Books</h2>
            <BookGrid books={featuredBooksFromAPI} />
          </div>
        </section>
      )}

      {/* Book Designs - Only show if there are book designs */}
      {bookDesigns.length > 0 && (
        <section ref={bookDesignsRef} className={`py-12 sm:py-16 bg-muted/30 ${bookDesignsVisible ? 'scale-in animate-in' : 'scale-in'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 mobile-text-gradient">Custom Book Designs</h2>
            <p className="text-muted-foreground mb-6">Read beautifully designed books with custom formatting.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {bookDesigns.slice(0, 6).map((design, index) => (
                <div key={design._id} className={`mobile-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${bookDesignsVisible ? 'mobile-card-animate animate-in' : 'mobile-card-animate'}`} style={{ transitionDelay: `${index * 0.1}s` }}>
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {design.coverImageUrl ? (
                      <img
                        src={design.coverImageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {design.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{design.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {design.author}</p>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{design.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {design.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-primary">
                        {design.isFree ? 'Free' : `$${design.price}`}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/reader/${design._id}`)}
                        className="flex items-center gap-1 mobile-button"
                      >
                        <BookOpenIcon className="h-4 w-4" />
                        Read
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
      {!loading && !hasAnyContent && (
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

      {/* Features Section - Only show if there's content or user is not authenticated */}
      {(hasAnyContent || !isAuthenticated) && (
        <section ref={featuresRef} className={`py-12 sm:py-16 bg-muted/30 ${featuresVisible ? 'rotate-in animate-in' : 'rotate-in'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 mobile-text-gradient">Why Choose BookTech?</h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the future of digital reading with our innovative platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className={`text-center space-y-4 mobile-card p-6 rounded-lg ${featuresVisible ? 'scroll-animate-stagger animate-in' : 'scroll-animate-stagger'}`}>
                <div className="bg-primary/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto">
                  <BookOpenIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">Advanced Reader</h3>
                <p className="text-muted-foreground">
                  Enjoy customizable reading experience with adjustable fonts, themes, and bookmarks
                </p>
              </div>
              <div className={`text-center space-y-4 mobile-card p-6 rounded-lg ${featuresVisible ? 'scroll-animate-stagger animate-in' : 'scroll-animate-stagger'}`}>
                <div className="bg-accent/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto">
                  <StarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">Premium Content</h3>
                <p className="text-muted-foreground">
                  Access exclusive books and latest releases from top authors worldwide
                </p>
              </div>
              <div className={`text-center space-y-4 mobile-card p-6 rounded-lg ${featuresVisible ? 'scroll-animate-stagger animate-in' : 'scroll-animate-stagger'}`}>
                <div className="bg-secondary/50 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto">
                  <UsersIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">Community</h3>
                <p className="text-muted-foreground">
                  Join thousands of readers, share reviews, and discover new favorites
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section - Only show if there's content or user is not authenticated */}
      {(hasAnyContent || !isAuthenticated) && <PricingSection />}

      {/* CTA Section - Only show if there's content or user is not authenticated */}
      {(hasAnyContent || !isAuthenticated) && (
        <section ref={ctaRef} className={`py-12 sm:py-16 bg-gradient-hero text-primary-foreground ${ctaVisible ? 'fade-in-bounce animate-in' : 'fade-in-bounce'}`}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">Ready to Start Reading?</h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90">
              Join thousands of readers and unlock unlimited access to premium content
            </p>
            <Button variant="premium" size="lg" className="text-lg px-8 py-4 mobile-button">
              Get Started Today
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookGrid from '@/components/Books/BookGrid';
import PricingSection from '@/components/Subscription/PricingSection';
import { ArrowRightIcon, BookOpenIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { setFeaturedBooks, fetchBooks } from '@/store/slices/booksSlice';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFeaturedBooks(books.slice(0, 3)));
  }, [books, dispatch]);

  // Determine user subscription status
  const isPremium = user?.subscription === 'premium' || user?.subscription === 'enterprise';

  // Recommended books: top 3 by rating or by category
  const recommendedBooks = isAuthenticated
    ? [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
    : [];

  const favoriteCategory = isAuthenticated ? getFavoriteCategory(user, books) : null;
  const booksInProgress = isAuthenticated ? getBooksInProgress(user, books) : [];
  const trendingInCategory = isAuthenticated ? getTrendingInCategory(favoriteCategory, books) : [];
  const becauseYouRead = isAuthenticated ? getBecauseYouRead(user, books) : [];

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
      <section className="relative bg-gradient-hero text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 text-center">
          {isAuthenticated && (
            <div className="mb-4 text-lg font-semibold">
              Welcome back, <span className="text-accent">{user?.name}</span>!
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Your Digital
            <br />
            <span className="text-accent">Library</span> Awaits
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Discover thousands of premium books, enjoy seamless reading experiences, 
            and unlock knowledge with our advanced digital platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant={isPremium ? 'default' : 'premium'}
              size="lg"
              className="text-lg px-8 py-4 relative"
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
              className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary relative"
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

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <BookOpenIcon className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-3xl font-bold text-primary">{books.filter(b => b.isPremium).length}+</h3>
              <p className="text-muted-foreground">Premium Books</p>
            </div>
            <div className="space-y-2">
              <UsersIcon className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-3xl font-bold text-primary">{books.length * 5}+</h3>
              <p className="text-muted-foreground">Happy Readers</p>
            </div>
            <div className="space-y-2">
              <StarIcon className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-3xl font-bold text-primary">
                {books.length > 0 ? (books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.length).toFixed(1) : '4.8'}/5
              </h3>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">Featured Books</h2>
              <p className="text-muted-foreground">Discover our most popular and trending titles</p>
            </div>
            <Button variant="outline">
              View All
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
          {loading && <p>Loading books...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <BookGrid books={featuredBooks} />
        </div>
      </section>

      {/* Recommended for You */}
      {isAuthenticated && recommendedBooks.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold mb-8">Recommended for You</h2>
            <BookGrid books={recommendedBooks} />
          </div>
        </section>
      )}

      {isAuthenticated && booksInProgress.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold mb-8">Continue Reading</h2>
            <p className="text-muted-foreground mb-4">Pick up where you left off.</p>
            <BookGrid books={booksInProgress} />
          </div>
        </section>
      )}
      {isAuthenticated && favoriteCategory && trendingInCategory.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold mb-8">Trending in {favoriteCategory}</h2>
            <p className="text-muted-foreground mb-4">Popular and new releases in your favorite category.</p>
            <BookGrid books={trendingInCategory} />
          </div>
        </section>
      )}
      {isAuthenticated && becauseYouRead.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold mb-8">Because You Read...</h2>
            <p className="text-muted-foreground mb-4">You might also like these books.</p>
            <BookGrid books={becauseYouRead} />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4">Why Choose BookTech?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of digital reading with our innovative platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <BookOpenIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Advanced Reader</h3>
              <p className="text-muted-foreground">
                Enjoy customizable reading experience with adjustable fonts, themes, and bookmarks
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <StarIcon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Premium Content</h3>
              <p className="text-muted-foreground">
                Access exclusive books and latest releases from top authors worldwide
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <UsersIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Community</h3>
              <p className="text-muted-foreground">
                Join thousands of readers, share reviews, and discover new favorites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold mb-4">Ready to Start Reading?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of readers and unlock unlimited access to premium content
          </p>
          <Button variant="premium" size="lg" className="text-lg px-8 py-4">
            Get Started Today
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
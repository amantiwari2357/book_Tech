import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpenIcon, 
  StarIcon, 
  UsersIcon, 
  ArrowRightIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  PlayIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { setFeaturedBooks, fetchBooks } from '@/store/slices/booksSlice';
import { addToCartAsync } from '@/store/slices/cartSlice';
import { authFetch } from '@/lib/api';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { toast } from '@/hooks/use-toast';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  coverImage?: string;
  rating: number;
  totalReviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const ModernHome: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { books, loading } = useAppSelector((state) => state.books);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Animation hooks
  const heroRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const booksRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();

  const categories = [
    'all', 'fiction', 'non-fiction', 'romance', 'mystery', 'thriller', 
    'sci-fi', 'fantasy', 'biography', 'self-help', 'business'
  ];

  const features: Feature[] = [
    {
      icon: <BookOpenIcon className="h-8 w-8" />,
      title: "Unlimited Reading",
      description: "Access thousands of books with unlimited reading time",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: "Read Anywhere",
      description: "Sync across all devices - phone, tablet, desktop",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "AI Recommendations",
      description: "Personalized book suggestions based on your taste",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your reading data is protected and private",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Book Lover',
      avatar: '/api/placeholder/100/100',
      content: 'This platform has completely transformed my reading experience. The AI recommendations are spot-on!',
      rating: 5
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Student',
      avatar: '/api/placeholder/100/100',
      content: 'I love how I can read on my phone during commute and continue on my laptop at home. Seamless experience!',
      rating: 5
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Writer',
      avatar: '/api/placeholder/100/100',
      content: 'The variety of books available is incredible. I discover new authors and genres I never knew I would love.',
      rating: 5
    }
  ];

  const stats = [
    { label: 'Books Available', value: '50,000+', icon: <BookOpenIcon className="h-6 w-6" /> },
    { label: 'Happy Readers', value: '1M+', icon: <UsersIcon className="h-6 w-6" /> },
    { label: 'Countries', value: '150+', icon: <GlobeAltIcon className="h-6 w-6" /> },
    { label: 'Languages', value: '25+', icon: <AcademicCapIcon className="h-6 w-6" /> }
  ];

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAddToCart = async (book: Book) => {
    try {
      await dispatch(addToCartAsync(book)).unwrap();
      toast({
        title: "Added to cart",
        description: `${book.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to cart.",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = (book: Book) => {
    // Implement wishlist functionality
    toast({
      title: "Added to wishlist",
      description: `${book.title} has been added to your wishlist.`,
    });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBooks = books.filter(book => book.isFeatured).slice(0, 6);
  const newReleases = books.filter(book => book.isNew).slice(0, 6);
  const bestsellers = books.filter(book => book.isBestseller).slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Helmet>
        <title>BookTech - Your Digital Library</title>
        <meta name="description" content="Discover, read, and manage your digital library with BookTech's premium reading platform" />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BookTech
                </span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#books" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Books
                </a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Reviews
                </a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Pricing
                </a>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <Button onClick={() => navigate('/user-dashboard')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <span className="text-lg">☰</span>}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Features</a>
              <a href="#books" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Books</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Reviews</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Pricing</a>
              {user ? (
                <Button onClick={() => navigate('/user-dashboard')} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600">
                  Dashboard
                </Button>
              ) : (
                <div className="space-y-2 mt-2">
                  <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/signup')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                <SparklesIcon className="h-4 w-4 mr-1" />
                New: AI-Powered Recommendations
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Your Digital
                </span>
                <br />
                <span className="text-gray-900">Library Awaits</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover, read, and manage thousands of books with our premium reading platform. 
                Experience the future of digital reading.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for books, authors, or genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-0"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full px-6"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => navigate('/browse')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BookOpenIcon className="h-6 w-6 mr-2" />
                Start Reading Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/browse')}
                className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg rounded-full hover:bg-blue-50 transition-all duration-300"
              >
                <PlayIcon className="h-6 w-6 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BookTech</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most advanced digital reading platform with cutting-edge features designed for modern readers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" ref={booksRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Discover Amazing <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Books</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              From bestsellers to hidden gems, find your next favorite book in our vast collection.
            </p>

            {/* Category Filter */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 mb-8">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="fiction">Fiction</TabsTrigger>
                <TabsTrigger value="romance">Romance</TabsTrigger>
                <TabsTrigger value="mystery">Mystery</TabsTrigger>
                <TabsTrigger value="thriller">Thriller</TabsTrigger>
                <TabsTrigger value="sci-fi">Sci-Fi</TabsTrigger>
                <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
                <TabsTrigger value="biography">Biography</TabsTrigger>
                <TabsTrigger value="self-help">Self Help</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="non-fiction">Non-Fiction</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredBooks.slice(0, 8).map((book) => (
                    <Card key={book._id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpenIcon className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          {book.isNew && (
                            <Badge className="bg-green-500 text-white">New</Badge>
                          )}
                          {book.isBestseller && (
                            <Badge className="bg-orange-500 text-white">Bestseller</Badge>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAddToWishlist(book)}
                            className="rounded-full p-2"
                          >
                            <HeartIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(book.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-1">({book.totalReviews})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">${book.price}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(book)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full"
                            >
                              <ShoppingCartIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/book/${book._id}`)}
                              className="rounded-full"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredBooks.length > 8 && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={() => navigate('/browse')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg rounded-full"
                    >
                      View All Books
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Readers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied readers who have transformed their reading experience with BookTech.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                      <CardContent className="p-12 text-center">
                        <div className="flex justify-center mb-6">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <StarIcon key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <blockquote className="text-2xl md:text-3xl text-gray-700 mb-8 leading-relaxed">
                          "{testimonial.content}"
                        </blockquote>
                        <div className="flex items-center justify-center">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full mr-4"
                          />
                          <div className="text-left">
                            <div className="font-semibold text-lg text-gray-900">{testimonial.name}</div>
                            <div className="text-gray-600">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join millions of readers worldwide and discover your next favorite book today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BookOpenIcon className="h-6 w-6 mr-2" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/browse')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg rounded-full transition-all duration-300"
            >
              <EyeIcon className="h-6 w-6 mr-2" />
              Browse Books
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpenIcon className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-2xl font-bold">BookTech</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your premier destination for digital reading. Discover, read, and manage your favorite books online with our modern platform designed for book lovers.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ShareIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/browse" className="hover:text-white transition-colors flex items-center gap-2"><BookOpenIcon className="h-4 w-4" /> Browse Books</a></li>
                <li><a href="/browse" className="hover:text-white transition-colors flex items-center gap-2"><HeartIcon className="h-4 w-4" /> Categories</a></li>
                <li><a href="/subscriptions" className="hover:text-white transition-colors flex items-center gap-2"><ShoppingCartIcon className="h-4 w-4" /> Subscriptions</a></li>
                <li><a href="/user-dashboard" className="hover:text-white transition-colors flex items-center gap-2"><UserIcon className="h-4 w-4" /> My Account</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/support" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><EnvelopeIcon className="h-4 w-4" /> support@book-tech.com</li>
                <li className="flex items-center gap-2"><PhoneIcon className="h-4 w-4" /> +1 (555) 123-4567</li>
                <li className="flex items-center gap-2"><MapPinIcon className="h-4 w-4" /> 123 Book Street, Reading City, RC 12345</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2025 BookTech. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernHome;

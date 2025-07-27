import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon, ShoppingCartIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { addToCartAsync } from '@/store/slices/cartSlice';
import { authFetch } from '@/lib/api';

type Review = {
  _id?: string;
  user?: { _id?: string; name?: string };
  rating: number;
  comment: string;
  date?: string;
};

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { books, loading, error } = useAppSelector((state) => state.books);
  const { user } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [orders, setOrders] = useState<{ _id?: string }[]>([]);

  const book = books.find(b => b.id === id);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewLoading(true);
      setReviewError('');
      try {
        const res = await authFetch(`/books/${id}/reviews`);
        const data = await res.json();
        setReviews(data);
        if (user) {
          setHasReviewed(data.some((r: Review) => r.user?._id === user.id));
        }
      } catch (err) {
        setReviewError('Failed to load reviews');
      } finally {
        setReviewLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id, user]);

  useEffect(() => {
    // Fetch user's orders and check if this book is purchased
    const checkPurchased = async () => {
      if (user && user.role === 'customer' && id) {
        try {
          const res = await authFetch('/cart/orders');
          const data = await res.json();
          setOrders(data);
          setHasPurchased(data.some((b: { _id?: string }) => b._id === id));
        } catch {
          setHasPurchased(false);
        }
      }
    };
    checkPurchased();
  }, [user, id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center"><p>Loading...</p></div>;
  }
  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center"><p className="text-red-500">{error}</p></div>;
  }
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
        <Link to="/browse">
          <Button variant="outline">← Back to Browse</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCartAsync(book.id));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-5 w-5 text-accent" />);
    }
    const remainingStars = 5 - fullStars;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarOutlineIcon key={`empty-${i}`} className="h-5 w-5 text-muted-foreground" />);
    }
    return stars;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewError('');
    try {
      const res = await authFetch(`/books/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        setRating(0);
        setComment('');
        setHasReviewed(true);
        // Refresh reviews
        const data = await res.json();
        setReviews(data);
      } else {
        const data = await res.json();
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link to="/browse">
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Browse
          </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="relative mb-6">
            <div className="aspect-[3/4] max-w-xs mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg overflow-hidden">
              {/* Loading State */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Image */}
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className={`w-full h-full object-cover transition-all duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => {
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                style={{
                  objectPosition: 'center',
                  minHeight: '300px',
                  maxHeight: '400px'
                }}
              />
              
              {/* Error State */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No Cover Image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <div className="text-muted-foreground mb-2">by {book.author}</div>
            <div className="flex items-center gap-2 mb-2">
              {renderStars(book.rating)}
              <span className="text-sm text-muted-foreground">({book.totalReviews} reviews)</span>
            </div>
            {book.isPremium && (
              <Badge className="bg-gradient-premium text-foreground border-0">Premium Content</Badge>
            )}
          </div>
          <div className="mb-4">{book.description}</div>
          <div className="mb-4 font-bold text-primary text-2xl">${book.price.toFixed(2)}</div>
          <Button variant="hero" size="lg" className="w-full mb-2" onClick={handleAddToCart}>
            <ShoppingCartIcon className="h-5 w-5 mr-2" /> Add to Cart
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link to={`/reader/${book.id}`}>
              <BookOpenIcon className="h-5 w-5 mr-2" /> Read Book
            </Link>
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {reviewLoading ? <p>Loading reviews...</p> : reviewError ? <p className="text-red-500">{reviewError}</p> : (
            <div className="space-y-4 mb-8">
              {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map((r) => (
                <div key={r._id || r.user?._id || Math.random()} className="border-b pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(r.rating)}
                    <span className="text-sm text-muted-foreground">by {r.user?.name || 'User'}</span>
                  </div>
                  <div className="text-sm">{r.comment}</div>
                  <div className="text-xs text-muted-foreground">{r.date ? new Date(r.date).toLocaleDateString() : ''}</div>
                </div>
              ))}
            </div>
          )}
          {user && user.role === 'customer' && hasPurchased && !hasReviewed && (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      <StarIcon className="h-6 w-6" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Comment</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Write your review..."
                />
              </div>
              {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
              <Button type="submit" disabled={submitting || rating === 0}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}
          {user && user.role === 'customer' && hasReviewed && (
            <p className="text-green-600 font-medium">You have already reviewed this book.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
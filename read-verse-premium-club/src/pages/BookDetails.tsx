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
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  // Add state for appeal modal
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [appealStatus, setAppealStatus] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealReviewId, setAppealReviewId] = useState<string | null>(null);
  // Add state for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteTargetReviewId, setDeleteTargetReviewId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

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

  // Handler for delete
  const handleDeleteReview = (reviewId: string) => {
    setDeleteTargetReviewId(reviewId);
    setDeleteReason('');
    setDeleteError('');
    setShowDeleteModal(true);
  };
  // Add confirmDeleteReview to actually send request
  const confirmDeleteReview = async () => {
    if (!deleteTargetReviewId || !id) return;
    if (!deleteReason || deleteReason.trim().length < 5) {
      setDeleteError('Please provide a reason (at least 5 characters).');
      return;
    }
    setEditLoading(true);
    setDeleteError('');
    try {
      const res = await authFetch(`/books/${id}/reviews/${deleteTargetReviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        setShowDeleteModal(false);
        setDeleteTargetReviewId(null);
      } else {
        const data = await res.json();
        setDeleteError(data.message || 'Failed to delete review.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Handler for start editing
  const startEditReview = (review: Review) => {
    setEditingReviewId(review._id || '');
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // Handler for submit edit
  const handleEditReview = async (reviewId: string) => {
    if (!id) return;
    if (!window.confirm('Save changes to this review?')) return;
    setEditLoading(true);
    try {
      const res = await authFetch(`/books/${id}/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        setEditingReviewId(null);
      } else {
        // Optionally handle error
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Add handler to open appeal modal
  const openAppealModal = (reviewId: string) => {
    setAppealReviewId(reviewId);
    setShowAppealModal(true);
    setAppealMessage('');
    setAppealStatus('');
  };
  // Add handler to submit appeal
  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReviewId || !id) return;
    setAppealLoading(true);
    setAppealStatus('');
    try {
      const res = await authFetch('/support/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: appealReviewId, bookId: id, message: appealMessage }),
      });
      if (res.ok) {
        setAppealStatus('Appeal submitted successfully. Our team will review your request.');
        setShowAppealModal(false);
      } else {
        setAppealStatus('Failed to submit appeal.');
      }
    } finally {
      setAppealLoading(false);
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
                  {editingReviewId === r._id ? (
                    <form onSubmit={e => { e.preventDefault(); handleEditReview(r._id!); }} className="space-y-2">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <button type="button" key={star} onClick={() => setEditRating(star)} className={star <= editRating ? 'text-yellow-400' : 'text-gray-300'}>
                            <StarIcon className="h-5 w-5" />
                          </button>
                        ))}
                      </div>
                      <textarea className="w-full p-2 border rounded" value={editComment} onChange={e => setEditComment(e.target.value)} rows={2} />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="text-sm">{r.comment}</div>
                      <div className="text-xs text-muted-foreground">{r.date ? new Date(r.date).toLocaleDateString() : ''}</div>
                      {/* Author controls */}
                      {user && book.authorRef === user.id && (
                        <div className="flex gap-2 mt-1">
                          <Button size="sm" variant="outline" onClick={() => startEditReview(r)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(r._id!)} disabled={editLoading}>{editLoading ? 'Deleting...' : 'Delete'}</Button>
                        </div>
                      )}
                      {user && r.user?._id === user.id && (
                        <Button size="sm" variant="outline" onClick={() => openAppealModal(r._id!)} className="ml-2">Appeal Moderation</Button>
                      )}
                    </>
                  )}
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
      {showAppealModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">Appeal Moderation Action</h2>
            <form onSubmit={handleAppealSubmit} className="space-y-3">
              <textarea
                className="w-full p-2 border rounded"
                value={appealMessage}
                onChange={e => setAppealMessage(e.target.value)}
                rows={4}
                placeholder="Explain why you believe this moderation action should be reviewed..."
                required
              />
              {appealStatus && <p className="text-green-600 text-sm">{appealStatus}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAppealModal(false)}>Cancel</Button>
                <Button type="submit" disabled={appealLoading}>{appealLoading ? 'Submitting...' : 'Submit Appeal'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">Delete Review</h2>
            <p className="mb-2">Please provide a reason for deleting this review (required):</p>
            <textarea
              className="w-full p-2 border rounded mb-2"
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              rows={3}
              placeholder="Reason for deletion..."
              required
            />
            {deleteError && <p className="text-red-500 text-sm mb-2">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={confirmDeleteReview} disabled={editLoading}>{editLoading ? 'Deleting...' : 'Delete Review'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
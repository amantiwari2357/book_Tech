import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  StarIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ShareIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  EyeIcon,
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  FilterIcon,
  SortAscendingIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Review {
  _id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  notHelpful: number;
  likes: number;
  comments: Comment[];
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage?: string;
  };
}

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

const Reviews: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  useEffect(() => {
    if (user) {
      fetchReviews();
      fetchMyReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const res = await authFetch('/reviews/my-reviews');
      if (res.ok) {
        const data = await res.json();
        setMyReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch my reviews:', error);
    }
  };

  const createReview = async () => {
    if (!selectedBook || !reviewForm.title || !reviewForm.content) {
      return;
    }

    try {
      const res = await authFetch('/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId: selectedBook._id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          content: reviewForm.content
        })
      });

      if (res.ok) {
        setShowReviewModal(false);
        setSelectedBook(null);
        setReviewForm({ rating: 5, title: '', content: '' });
        fetchReviews();
        fetchMyReviews();
      }
    } catch (error) {
      console.error('Failed to create review:', error);
    }
  };

  const updateReview = async () => {
    if (!editingReview || !reviewForm.title || !reviewForm.content) {
      return;
    }

    try {
      const res = await authFetch(`/reviews/${editingReview._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: reviewForm.title,
          content: reviewForm.content
        })
      });

      if (res.ok) {
        setShowReviewModal(false);
        setEditingReview(null);
        setReviewForm({ rating: 5, title: '', content: '' });
        fetchReviews();
        fetchMyReviews();
      }
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const res = await authFetch(`/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchReviews();
        fetchMyReviews();
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const likeReview = async (reviewId: string) => {
    try {
      const res = await authFetch(`/reviews/${reviewId}/like`, {
        method: 'POST'
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to like review:', error);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const res = await authFetch(`/reviews/${reviewId}/helpful`, {
        method: 'POST'
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    }
  };

  const addComment = async (reviewId: string, content: string) => {
    try {
      const res = await authFetch(`/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
            disabled={!interactive}
          >
            <StarIcon
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getFilteredReviews = () => {
    let filtered = activeTab === 'my-reviews' ? myReviews : reviews;

    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        case 'likes':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    return filtered;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access reviews.</p>
        </div>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer-dashboard')}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Reviews & Ratings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowReviewModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Reviews</p>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                </div>
                <StarIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">My Reviews</p>
                  <p className="text-2xl font-bold">{myReviews.length}</p>
                </div>
                <UserIcon className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg. Rating</p>
                  <p className="text-2xl font-bold">
                    {reviews.length > 0 
                      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <StarIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold">
                    {reviews.reduce((sum, review) => sum + review.likes, 0)}
                  </p>
                </div>
                <HeartIcon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                className="border rounded-lg px-3 py-2"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="helpful">Most Helpful</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="space-y-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <Card key={review._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">{review.userName}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                {renderStars(review.rating)}
                                <span>•</span>
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                {review.isVerified && (
                                  <>
                                    <span>•</span>
                                    <Badge variant="secondary" className="text-xs">
                                      Verified Purchase
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                            {activeTab === 'my-reviews' && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingReview(review);
                                    setReviewForm({
                                      rating: review.rating,
                                      title: review.title,
                                      content: review.content
                                    });
                                    setShowReviewModal(true);
                                  }}
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteReview(review._id)}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
                            <p className="text-gray-700">{review.content}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => likeReview(review._id)}
                              >
                                <HeartIcon className="w-4 h-4 mr-2" />
                                {review.likes}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markHelpful(review._id)}
                              >
                                <HandThumbUpIcon className="w-4 h-4 mr-2" />
                                Helpful ({review.helpful})
                              </Button>
                              <Button variant="outline" size="sm">
                                <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                                Comment ({review.comments.length})
                              </Button>
                              <Button variant="outline" size="sm">
                                <ShareIcon className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              <p>Review for: {review.book.title}</p>
                              <p>by {review.book.author}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No matching reviews' : 'No reviews yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : activeTab === 'my-reviews'
                        ? 'Start writing reviews to see them here.'
                        : 'Be the first to write a review!'
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setShowReviewModal(true)}>
                        Write Your First Review
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingReview ? 'Edit Review' : 'Write a Review'}
            </h3>
            
            <div className="space-y-4">
              {!editingReview && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Book</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => {
                      const book = JSON.parse(e.target.value);
                      setSelectedBook(book);
                    }}
                  >
                    <option value="">Choose a book to review</option>
                    {/* In a real app, fetch user's purchased books */}
                    <option value='{"_id":"book1","title":"Sample Book","author":"Sample Author"}'>
                      Sample Book by Sample Author
                    </option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm({...reviewForm, rating})
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Review Title</label>
                <Input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                  placeholder="Summarize your review in a few words"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Review Content</label>
                <Textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                  placeholder="Share your thoughts about this book..."
                  rows={6}
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false);
                  setEditingReview(null);
                  setSelectedBook(null);
                  setReviewForm({ rating: 5, title: '', content: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingReview ? updateReview : createReview}
                disabled={!reviewForm.title || !reviewForm.content || (!editingReview && !selectedBook)}
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews; 
const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ModerationLog = require('../models/ModerationLog');
const nodemailer = require('nodemailer');

const router = express.Router();

// Setup nodemailer transporter (example using Gmail, replace with your SMTP config)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get all approved books (premium first)
router.get('/', async (req, res) => {
  const books = await Book.find({ status: 'approved' }).sort({ isPremium: -1 });
  res.json(books);
});

// Search books (public endpoint)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  const searchQuery = q.trim();
  if (searchQuery.length < 2) {
    return res.json([]);
  }

  try {
    const books = await Book.find({
      status: 'approved',
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { author: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ]
    }).limit(10).select('title author category coverImage tags');

    res.json(books);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get book by ID (public for approved books, auth required for others)
router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  
  // If book is approved, allow public access
  if (book.status === 'approved') {
    return res.json(book);
  }
  
  // For non-approved books, require authentication
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Verify token and check permissions
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (user.role !== 'admin' && (!book.authorRef || book.authorRef.toString() !== user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(book);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Get books by current author (all statuses)
router.get('/my/books', auth, async (req, res) => {
  const books = await Book.find({ authorRef: req.user.id });
  res.json(books);
});

// Create book (set authorRef, status pending)
router.post('/', auth, async (req, res) => {
  const { readingType } = req.body;
  if (!readingType || !['soft', 'hard'].includes(readingType)) {
    return res.status(400).json({ message: 'readingType (soft or hard) is required' });
  }
  const book = new Book({ ...req.body, authorRef: req.user.id, status: 'pending' });
  await book.save();
  res.status(201).json(book);
});

// Update book (only if current user is author)
router.put('/:id', auth, async (req, res) => {
  const book = await Book.findOneAndUpdate({ _id: req.params.id, authorRef: req.user.id }, req.body, { new: true });
  if (!book) return res.status(404).json({ message: 'Book not found or not your book' });
  res.json(book);
});

// Delete book (only if current user is author)
router.delete('/:id', auth, async (req, res) => {
  const book = await Book.findOneAndDelete({ _id: req.params.id, authorRef: req.user.id });
  if (!book) return res.status(404).json({ message: 'Book not found or not your book' });
  res.json({ message: 'Book deleted' });
});

// Admin: List pending books
router.get('/admin/pending', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const books = await Book.find({ status: 'pending' });
  res.json(books);
});

// Admin: Approve book
router.post('/admin/approve/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { displayType, distributionType, isRecommended } = req.body;
  if (!displayType || !['hero', 'view-all'].includes(displayType)) {
    return res.status(400).json({ message: 'displayType (hero or view-all) is required' });
  }
  if (!distributionType || !['soft', 'hard'].includes(distributionType)) {
    return res.status(400).json({ message: 'distributionType (soft or hard) is required' });
  }
  
  const updateData = { 
    status: 'approved', 
    displayType, 
    distributionType 
  };
  
  // Add isRecommended if provided
  if (isRecommended !== undefined) {
    updateData.isRecommended = isRecommended;
  }
  
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );
  if (!book) return res.status(404).json({ message: 'Book not found' });

  // Send notification to author
  let displayText = displayType === 'hero' ? 'Hero Section' : 'View All Section';
  let distText = distributionType === 'soft'
    ? 'You selected to offer the book as a Soft Copy only.'
    : 'You selected to offer the book as a Hard Copy (delivery available).';
  let recommendedText = isRecommended ? '\nYour book has also been marked as recommended and will appear in the "Recommended for You" section.' : '';
  const message = `Your book '${book.title}' has been approved and will appear in the ${displayText}.\n${distText}${recommendedText}`;
  await Notification.create({
    recipient: book.authorRef,
    sender: req.user.id,
    message,
    type: 'info',
  });

  res.json(book);
});

// Admin: Reject book
router.post('/admin/reject/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const book = await Book.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// Admin: Toggle recommended status
router.post('/admin/toggle-recommended/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  
  book.isRecommended = !book.isRecommended;
  await book.save();
  
  res.json({ 
    message: `Book ${book.isRecommended ? 'added to' : 'removed from'} recommended section`,
    isRecommended: book.isRecommended 
  });
});

// Admin: Toggle featured status
router.post('/admin/toggle-featured/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  
  book.isFeatured = !book.isFeatured;
  await book.save();
  
  res.json({ 
    message: `Book ${book.isFeatured ? 'added to' : 'removed from'} featured section`,
    isFeatured: book.isFeatured 
  });
});

// Get recommended books
router.get('/recommended/list', async (req, res) => {
  const books = await Book.find({ status: 'approved', isRecommended: true }).sort({ createdAt: -1 });
  res.json(books);
});

// Get featured books
router.get('/featured/list', async (req, res) => {
  const books = await Book.find({ status: 'approved', isFeatured: true }).sort({ createdAt: -1 });
  res.json(books);
});

// Add a review to a book
router.post('/:id/reviews', auth, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating) return res.status(400).json({ message: 'Rating required' });
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  // Prevent duplicate reviews by same user
  if (book.reviews.some(r => r.user.toString() === req.user.id)) {
    return res.status(400).json({ message: 'You have already reviewed this book' });
  }
  book.reviews.push({ user: req.user.id, rating, comment });
  // Update average rating and totalReviews
  book.totalReviews = book.reviews.length;
  book.rating = book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.totalReviews;
  await book.save();
  res.status(201).json(book.reviews);
});

// Get all reviews for a book
router.get('/:id/reviews', async (req, res) => {
  const book = await Book.findById(req.params.id).populate('reviews.user', 'name');
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book.reviews);
});

// Edit a review (author or admin)
router.put('/:bookId/reviews/:reviewId', auth, async (req, res) => {
  const { rating, comment } = req.body;
  const book = await Book.findById(req.params.bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const isAuthor = book.authorRef.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ message: 'Only the author or admin can edit reviews' });
  }
  const review = book.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  const now = new Date();
  const reviewDate = review.date || review.createdAt || now;
  const diffDays = (now - new Date(reviewDate)) / (1000 * 60 * 60 * 24);
  if (diffDays > 7 && !isAdmin) {
    return res.status(403).json({ message: 'You can only edit or delete reviews within 7 days of posting.' });
  }
  const oldValue = { rating: review.rating, comment: review.comment };
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  // Recalculate rating and totalReviews
  book.rating = book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length;
  await book.save();
  // Log moderation action
  await ModerationLog.create({
    actionType: 'edit',
    book: book._id,
    review: review._id.toString(),
    moderator: req.user.id,
    targetUser: review.user,
    oldValue,
    newValue: { rating: review.rating, comment: review.comment },
  });
  // Notify the reviewer
  await Notification.create({
    recipient: review.user,
    sender: req.user.id,
    message: `Your review on "${book.title}" was edited by ${isAdmin ? 'an admin' : 'the author'}.`,
    type: 'info',
  });
  // Fetch reviewer's email
  const reviewerUser = await User.findById(review.user);
  if (reviewerUser && reviewerUser.email) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: reviewerUser.email,
      subject: `Your review was edited`,
      text: `Hello ${reviewerUser.name || ''},\n\nYour review on the book "${book.title}" was edited by ${isAdmin ? 'an admin' : 'the author'}.\n\nIf you have questions, you can appeal this action in your dashboard.\n\nThank you.`,
    });
  }
  res.json(book.reviews);
});

// Delete a review (author or admin)
router.delete('/:bookId/reviews/:reviewId', auth, async (req, res) => {
  const { reason } = req.body;
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ message: 'A reason (at least 5 characters) is required to delete a review.' });
  }
  const book = await Book.findById(req.params.bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const isAuthor = book.authorRef.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ message: 'Only the author or admin can delete reviews' });
  }
  const review = book.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  const now = new Date();
  const reviewDate = review.date || review.createdAt || now;
  const diffDays = (now - new Date(reviewDate)) / (1000 * 60 * 60 * 24);
  if (diffDays > 7 && !isAdmin) {
    return res.status(403).json({ message: 'You can only edit or delete reviews within 7 days of posting.' });
  }
  // Log moderation action before removing
  await ModerationLog.create({
    actionType: 'delete',
    book: book._id,
    review: review._id.toString(),
    moderator: req.user.id,
    targetUser: review.user,
    reason,
    oldValue: { rating: review.rating, comment: review.comment },
  });
  // Notify the reviewer before removing
  await Notification.create({
    recipient: review.user,
    sender: req.user.id,
    message: `Your review on "${book.title}" was deleted by ${isAdmin ? 'an admin' : 'the author'}.${reason ? ' Reason: ' + reason : ''}`,
    type: 'info',
  });
  // Fetch reviewer's email
  const reviewerUser = await User.findById(review.user);
  if (reviewerUser && reviewerUser.email) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: reviewerUser.email,
      subject: `Your review was deleted`,
      text: `Hello ${reviewerUser.name || ''},\n\nYour review on the book "${book.title}" was deleted by ${isAdmin ? 'an admin' : 'the author'}.${reason ? '\nReason: ' + reason : ''}\n\nIf you have questions, you can appeal this action in your dashboard.\n\nThank you.`,
    });
  }
  review.remove();
  // Recalculate rating and totalReviews
  book.totalReviews = book.reviews.length;
  book.rating = book.reviews.length > 0 ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length : 0;
  await book.save();
  res.json(book.reviews);
});

// Get moderation log for a book (author only)
router.get('/:id/moderation-log', auth, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.authorRef.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only the author can view the moderation log' });
  }
  const logs = await ModerationLog.find({ book: book._id }).sort({ timestamp: -1 }).populate('moderator', 'name').populate('targetUser', 'name');
  res.json(logs);
});

module.exports = router; 
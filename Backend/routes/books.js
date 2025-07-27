const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all approved books (premium first)
router.get('/', async (req, res) => {
  const books = await Book.find({ status: 'approved' }).sort({ isPremium: -1 });
  res.json(books);
});

// Get book by ID (only if approved or author/admin)
router.get('/:id', auth, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.status !== 'approved' && req.user.role !== 'admin' && (!book.authorRef || book.authorRef.toString() !== req.user.id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(book);
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
  const { displayType, distributionType } = req.body;
  if (!displayType || !['hero', 'view-all'].includes(displayType)) {
    return res.status(400).json({ message: 'displayType (hero or view-all) is required' });
  }
  if (!distributionType || !['soft', 'hard'].includes(distributionType)) {
    return res.status(400).json({ message: 'distributionType (soft or hard) is required' });
  }
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', displayType, distributionType },
    { new: true }
  );
  if (!book) return res.status(404).json({ message: 'Book not found' });

  // Send notification to author
  let displayText = displayType === 'hero' ? 'Hero Section' : 'View All Section';
  let distText = distributionType === 'soft'
    ? 'You selected to offer the book as a Soft Copy only.'
    : 'You selected to offer the book as a Hard Copy (delivery available).';
  const message = `Your book '${book.title}' has been approved and will appear in the ${displayText}.\n${distText}`;
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

module.exports = router; 
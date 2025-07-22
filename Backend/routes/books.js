const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const User = require('../models/User');

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
  const book = await Book.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// Admin: Reject book
router.post('/admin/reject/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const book = await Book.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
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
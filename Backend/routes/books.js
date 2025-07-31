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

// Get all books (with privacy controls)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, apply privacy controls
    if (req.user.role !== 'admin') {
      // Only show approved books to non-admin users
      query.isApproved = true;
      
      // If user is author, also show their own books (even if not approved)
      if (req.user.role === 'author') {
        query.$or = [
          { isApproved: true }, // Show all approved books
          { authorRef: req.user.id } // Show author's own books
        ];
      }
    }
    
    const books = await Book.find(query).populate('authorRef', 'name email');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search books (with privacy controls)
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Apply privacy controls
    if (req.user.role !== 'admin') {
      query.isApproved = true;
      
      if (req.user.role === 'author') {
        query.$or = [
          { isApproved: true },
          { authorRef: req.user.id }
        ];
      }
    }
    
    const books = await Book.find(query).populate('authorRef', 'name email');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book by ID (with privacy controls)
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('authorRef', 'name email');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Privacy check: Only show book if:
    // 1. User is admin, OR
    // 2. Book is approved, OR
    // 3. User is the author of the book
    if (req.user.role !== 'admin' && 
        !book.isApproved && 
        book.authorRef.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Book not approved yet.' });
    }
    
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get books by current author (only their own books)
router.get('/my-books', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author') {
      return res.status(403).json({ message: 'Only authors can access their books' });
    }
    
    const books = await Book.find({ authorRef: req.user.id }).populate('authorRef', 'name email');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get books by current author (alternative route)
router.get('/author-books', auth, async (req, res) => {
  const books = await Book.find({ authorRef: req.user.id });
  res.json(books);
});

// Get currently reading books (for customers)
router.get('/currently-reading', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('readBooks');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const currentlyReading = []; // For now, return empty array
    res.json(currentlyReading);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get favorite books (for customers)
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const favorites = []; // For now, return empty array
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new book (authors only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author') {
      return res.status(403).json({ message: 'Only authors can create books' });
    }
    
    const { title, description, price, category, coverImage, content } = req.body;
    
    const book = new Book({
      title,
      description,
      price,
      category,
      coverImage,
      content,
      authorRef: req.user.id,
      isApproved: false, // New books need admin approval
      createdAt: new Date()
    });
    
    await book.save();
    
    // Send notification to admin about new book
    // This would typically be done through a notification system
    console.log(`New book "${title}" created by ${req.user.name} - awaiting approval`);
    
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book (authors can only update their own books)
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Only author can update their own book, or admin can update any book
    if (req.user.role !== 'admin' && book.authorRef.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isApproved: false }, // Reset approval status when updated
      { new: true }
    );
    
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book (authors can only delete their own books)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Only author can delete their own book, or admin can delete any book
    if (req.user.role !== 'admin' && book.authorRef.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve book
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Reject book
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending books for admin approval
router.get('/admin/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const pendingBooks = await Book.find({ isApproved: false })
      .populate('authorRef', 'name email');
    
    res.json(pendingBooks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
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
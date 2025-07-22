const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// List all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Delete a user
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Update a user (name, email, role)
router.put('/users/:id', auth, requireAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// List all books
router.get('/books', auth, requireAdmin, async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// Delete a book
router.delete('/books/:id', auth, requireAdmin, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Book deleted' });
});

// Update a book (any field)
router.put('/books/:id', auth, requireAdmin, async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// Analytics endpoint
router.get('/analytics', auth, requireAdmin, async (req, res) => {
  const users = await User.find();
  const books = await Book.find();
  // User counts by role
  const userCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  // Book count
  const bookCount = books.length;
  // Order count
  const orderCount = users.reduce((acc, u) => acc + (u.orders?.length || 0), 0);
  // Book order counts (popularity)
  const bookOrderCounts = {};
  users.forEach(u => {
    (u.orders || []).forEach(o => {
      const id = o.book?.toString();
      if (id) bookOrderCounts[id] = (bookOrderCounts[id] || 0) + 1;
    });
  });
  // Book counts by category
  const bookCategoryCounts = books.reduce((acc, b) => {
    if (b.category) acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});
  res.json({ userCounts, bookCount, orderCount, bookOrderCounts, bookCategoryCounts });
});

module.exports = router; 
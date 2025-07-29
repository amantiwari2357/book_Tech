const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const BookDesign = require('../models/BookDesign');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
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

// Delete a user with cascade deletion
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user info before deletion for logging
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascade deletion: Delete all related data
    const deletionResults = await Promise.allSettled([
      // Delete user's book designs
      BookDesign.deleteMany({ authorRef: userId }),
      
      // Delete user's books (if they are an author)
      Book.deleteMany({ authorRef: userId }),
      
      // Delete notifications sent by this user
      Notification.deleteMany({ sender: userId }),
      
      // Delete notifications received by this user
      Notification.deleteMany({ recipient: userId }),
      
      // Delete orders by this user
      Order.deleteMany({ user: userId }),
      
      // Finally delete the user
      User.findByIdAndDelete(userId)
    ]);

    // Check if any deletions failed
    const failedDeletions = deletionResults.filter(result => result.status === 'rejected');
    if (failedDeletions.length > 0) {
      console.error('Some cascade deletions failed:', failedDeletions);
      return res.status(500).json({ 
        message: 'User deleted but some related data cleanup failed',
        failedDeletions: failedDeletions.length
      });
    }

    // Log the deletion
    console.log(`Admin deleted user: ${user.email} (${user.role})`);
    
    res.json({ 
      message: 'User and all related data deleted successfully',
      deletedUser: {
        id: userId,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
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

// Cleanup orphaned data
router.post('/cleanup', auth, requireAdmin, async (req, res) => {
  try {
    console.log('Admin triggered cleanup of orphaned data');
    
    // Get all user IDs
    const users = await User.find({}, '_id');
    const userIds = users.map(user => user._id.toString());
    
    const cleanupResults = await Promise.allSettled([
      // Cleanup orphaned book designs
      BookDesign.deleteMany({ authorRef: { $nin: userIds } }),
      
      // Cleanup orphaned books
      Book.deleteMany({ authorRef: { $nin: userIds } }),
      
      // Cleanup orphaned notifications
      Notification.deleteMany({
        $or: [
          { sender: { $nin: userIds } },
          { recipient: { $nin: userIds } }
        ]
      }),
      
      // Cleanup orphaned orders
      Order.deleteMany({ user: { $nin: userIds } })
    ]);
    
    const results = cleanupResults.map((result, index) => {
      const types = ['book designs', 'books', 'notifications', 'orders'];
      if (result.status === 'fulfilled') {
        return { type: types[index], deleted: result.value.deletedCount };
      } else {
        return { type: types[index], error: result.reason.message };
      }
    });
    
    res.json({
      message: 'Cleanup completed',
      results
    });
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ message: 'Error during cleanup' });
  }
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
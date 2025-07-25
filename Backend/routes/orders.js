const express = require('express');
const Order = require('../models/Order');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();

// Place a new order (customer)
router.post('/', auth, async (req, res) => {
  const { bookId, address } = req.body;
  if (!bookId || !address) return res.status(400).json({ message: 'Book and address required' });
  const book = await Book.findById(bookId);
  if (!book || book.distributionType !== 'hard') {
    return res.status(400).json({ message: 'Book not available for hard copy order' });
  }
  const order = new Order({
    book: bookId,
    user: req.user.id,
    address
  });
  await order.save();
  res.status(201).json(order);
});

// Admin: Get all orders
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const orders = await Order.find().populate('book user');
  res.json(orders);
});

// Admin: Update order status
router.put('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { status } = req.body;
  if (!['pending', 'shipped', 'delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

module.exports = router; 
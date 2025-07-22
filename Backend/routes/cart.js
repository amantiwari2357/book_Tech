const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user cart
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart');
  res.json(user.cart);
});

// Add book to cart
router.post('/:bookId', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user.cart.includes(req.params.bookId)) {
    user.cart.push(req.params.bookId);
    await user.save();
  }
  res.json(user.cart);
});

// Remove book from cart
router.delete('/:bookId', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = user.cart.filter(id => id.toString() !== req.params.bookId);
  await user.save();
  res.json(user.cart);
});

// Get user order history (with book details and date)
router.get('/orders', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('orders.book');
  res.json(user.orders);
});

module.exports = router; 
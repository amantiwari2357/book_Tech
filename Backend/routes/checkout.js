const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Simulate checkout
router.post('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  // Add all cart books to orders if not already present
  user.cart.forEach(bookId => {
    if (!user.orders.some(o => o.book.toString() === bookId.toString())) {
      user.orders.push({ book: bookId, date: new Date() });
    }
  });
  user.cart = [];
  await user.save();
  res.json({ message: 'Checkout successful, cart cleared.', orders: user.orders });
});

module.exports = router; 
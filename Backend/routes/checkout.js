const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment link for checkout
router.post('/create-payment-link', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    const user = await User.findById(req.user.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.price || book.price <= 0) {
      return res.status(400).json({ message: 'Invalid book price' });
    }

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(book.price * 100), // Convert to paise
      currency: "INR",
      description: `Payment for book: ${book.title}`,
      customer: {
        name: user.name,
        email: user.email,
        contact: user.phone || '',
      },
      notify: { sms: true, email: true },
      callback_url: `${process.env.FRONTEND_URL || 'https://book-tech.vercel.app'}/payment-success`,
      callback_method: "get"
    });

    // Create order record
    const order = await Order.create({
      book: book._id,
      customer: user._id,
      author: book.authorRef,
      amount: book.price,
      paymentLinkId: paymentLink.id,
      paymentStatus: 'created',
      orderStatus: 'pending'
    });

    res.json({ 
      paymentLink: paymentLink.short_url, 
      orderId: order._id,
      amount: book.price 
    });
  } catch (error) {
    console.error('Payment link creation error:', error);
    res.status(500).json({ message: 'Failed to create payment link' });
  }
});

// Legacy checkout (for backward compatibility)
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
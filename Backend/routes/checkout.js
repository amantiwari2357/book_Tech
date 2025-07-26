const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const Plan = require('../models/Plan');
const adminAuth = require('../middleware/auth'); // Use your existing auth middleware for admin check

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

    if (!book.price || book.price < 1) {
      return res.status(400).json({ message: 'Book price must be at least ₹1.00 (100 paise) for payment.' });
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

// Create payment link for subscription
router.post('/create-subscription-link', auth, async (req, res) => {
  try {
    const { planId, planName, planPrice } = req.body;
    const user = await User.findById(req.user.id);
    if (!planId || !planName || !planPrice) {
      return res.status(400).json({ message: 'Plan details are required' });
    }
    if (planPrice < 1) {
      return res.status(400).json({ message: 'Plan price must be at least ₹1.00 (100 paise) for payment.' });
    }
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(planPrice * 100), // Convert to paise
      currency: 'INR',
      description: `Subscription payment for plan: ${planName}`,
      customer: {
        name: user.name,
        email: user.email,
        contact: user.phone || '',
      },
      notify: { sms: true, email: true },
      callback_url: `${process.env.FRONTEND_URL || 'https://book-tech.vercel.app'}/payment-success`,
      callback_method: 'get',
    });
    // Optionally, you can store a pending subscription record here
    res.json({ paymentLink: paymentLink.short_url, paymentLinkId: paymentLink.id, planId, planName, planPrice });
  } catch (error) {
    console.error('Subscription payment link creation error:', error);
    res.status(500).json({ message: 'Failed to create subscription payment link' });
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

// Subscription plans (could be moved to DB/config in future)
const availablePlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    features: ['Access to 1000+ books', 'Standard support', 'Basic reading features'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    features: ['Access to all books', 'Priority support', 'Advanced reading features', 'Offline reading'],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 39.99,
    features: ['Everything in Premium', 'Team collaboration', 'Admin dashboard', 'Custom integrations'],
  },
];

// Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

// Admin: Create a new plan
router.post('/plans', adminAuth, async (req, res) => {
  try {
    // Optionally check req.user.role === 'admin'
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create plan' });
  }
});

// Admin: Update a plan
router.put('/plans/:id', adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update plan' });
  }
});

// Admin: Delete a plan
router.delete('/plans/:id', adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete plan' });
  }
});

module.exports = router; 
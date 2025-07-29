const express = require('express');
const Order = require('../models/Order');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();

// Razorpay integration
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Check if Razorpay credentials are available
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  Razorpay credentials not found. Payment features will be disabled.');
  console.warn('📝 Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file');
}

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Create Razorpay payment order
router.post('/create-payment', auth, async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment gateway is not configured. Please contact support.' 
      });
    }

    const { items, total, shippingAddress, paymentMethod, userId } = req.body;
    
    // Calculate amount in paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(total * 1.18 * 100); // Including 18% tax
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: 'booktech_' + Date.now(),
      notes: {
        userId: userId,
        items: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress)
      }
    });
    
    res.json({
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      order_id: razorpayOrder.id,
      receipt: razorpayOrder.receipt
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment gateway is not configured. Please contact support.' 
      });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id } = req.body;
    
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Get order details from Razorpay
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const notes = razorpayOrder.notes;
    
    // Create order in database
    const order = new Order({
      orderId: 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase(),
      userId: req.user.id,
      items: JSON.parse(notes.items),
      total: razorpayOrder.amount / 100, // Convert from paise to rupees
      shippingAddress: JSON.parse(notes.shippingAddress),
      paymentMethod: { type: 'razorpay' },
      status: 'processing',
      paymentStatus: 'completed',
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      message: 'Failed to verify payment',
      error: error.message 
    });
  }
});

// Test route to check if orders route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Orders route is working!', timestamp: new Date().toISOString() });
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Create new order from cart
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod } = req.body;
    
    // Generate unique order ID
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const order = new Order({
      orderId,
      userId: req.user.id,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    await order.save();
    
    // Update payment status to completed (for demo)
    order.paymentStatus = 'completed';
    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get order by ID
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Update order status (admin only)
router.patch('/:orderId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update order status' });
    }
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all orders' });
    }
    
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

module.exports = router; 
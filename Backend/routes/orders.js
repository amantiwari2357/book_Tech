const express = require('express');
const Order = require('../models/Order');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();

// Get customer's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('book', 'title author coverImage price')
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get author's orders (orders for books they wrote)
router.get('/author-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ author: req.user.id })
      .populate('book', 'title author coverImage price')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Update order status (author only)
router.patch('/update-status/:orderId', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only author can update order status
    if (order.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    order.orderStatus = orderStatus;
    order.updatedAt = Date.now();
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Get order by ID
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('book', 'title author coverImage price')
      .populate('customer', 'name email')
      .populate('author', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (order.customer.toString() !== req.user.id && order.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

module.exports = router; 
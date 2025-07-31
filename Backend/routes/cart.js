const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user cart
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart');
    res.json({ items: user.cart || [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// Add book to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    
    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user.cart) {
      user.cart = [];
    }
    
    // Check if book already in cart
    const existingItem = user.cart.find(item => item.bookId.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ bookId, quantity });
    }
    
    await user.save();
    await user.populate('cart.bookId', 'title author coverImage price');
    
    res.json({ items: user.cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.patch('/update', auth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    
    const user = await User.findById(req.user.id);
    const item = user.cart.find(item => item._id.toString() === itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    await user.save();
    await user.populate('cart.bookId', 'title author coverImage price');
    
    res.json({ items: user.cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// Remove book from cart
router.delete('/remove', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item._id.toString() !== itemId);
    await user.save();
    await user.populate('cart.bookId', 'title author coverImage price');
    
    res.json({ items: user.cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

// Reorder functionality
router.post('/reorder', auth, async (req, res) => {
  try {
    console.log('POST /reorder route hit');
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Validate ObjectId format
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    // Validate ObjectId format
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Privacy check
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.user.id);
    if (!user.cart) {
      user.cart = [];
    }

    // Add all items from the order to cart
    for (const item of order.items) {
      const existingItem = user.cart.find(cartItem => cartItem.bookId.toString() === item.bookId.toString());
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        user.cart.push({ bookId: item.bookId, quantity: 1 });
      }
    }

    await user.save();
    await user.populate('cart.bookId', 'title author coverImage price');
    
    res.json({ 
      message: 'Items added to cart successfully',
      items: user.cart 
    });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ message: 'Failed to reorder' });
  }
});

// Get user order history (with book details and date)
router.get('/orders', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('orders.book');
    res.json(user.orders || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

module.exports = router; 
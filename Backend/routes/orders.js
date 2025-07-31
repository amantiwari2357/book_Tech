const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.bookId', 'title author coverImage')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get user's orders (privacy controlled) - MUST come before /:id route
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.bookId', 'title author coverImage price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get user's orders (alternative route)
router.get('/user-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.bookId', 'title author coverImage price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get returns (must come before /:id route)
router.get('/returns', auth, async (req, res) => {
  try {
    // For now, return empty array - implement returns logic later
    res.json([]);
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ message: 'Failed to fetch returns' });
  }
});

// Create return request
router.post('/returns', auth, async (req, res) => {
  try {
    const { orderId, reason, description } = req.body;
    
    // For now, just return success - implement return logic later
    res.status(201).json({
      _id: 'temp-return-id',
      orderId,
      reason,
      description,
      status: 'pending',
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({ message: 'Failed to create return' });
  }
});

// Get order by ID (with privacy check) - MUST come after specific routes
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.bookId', 'title author coverImage price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Privacy check: Only show order if user is admin or the order owner
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await order.save();
    
    // Populate the order with book details for response
    await order.populate('items.bookId', 'title author coverImage price');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status, trackingNumber, estimatedDelivery } = req.body;
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Update payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    
    const updateData = {
      paymentStatus,
      updatedAt: new Date()
    };
    
    if (transactionId) updateData.transactionId = transactionId;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

// Download invoice
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.bookId', 'title author price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Privacy check
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // For now, return a simple JSON response
    // In production, generate actual PDF invoice
    res.json({
      orderId: order._id,
      customerName: order.userId.name,
      items: order.items,
      totalAmount: order.totalAmount,
      date: order.createdAt
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});

// Cancel order (user can cancel their own orders, admin can cancel any)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Privacy check: Only allow if user is admin or order owner
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only allow cancellation if order is still pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    
    order.status = 'cancelled';
    order.updatedAt = new Date();
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

// Get order statistics (admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ message: 'Failed to fetch order statistics' });
  }
});

// Get real-time order updates (WebSocket endpoint placeholder)
router.get('/realtime/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'name email')
      .populate('items.bookId', 'title author coverImage');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Privacy check
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      lastUpdated: order.updatedAt
    });
  } catch (error) {
    console.error('Error fetching real-time order:', error);
    res.status(500).json({ message: 'Failed to fetch order updates' });
  }
});

module.exports = router; 
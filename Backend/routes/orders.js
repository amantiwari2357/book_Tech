const express = require('express');
const Order = require('../models/Order');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();

// Razorpay integration
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Email functionality
const nodemailer = require('nodemailer');

// Create email transporter (only if email credentials are available)
// To enable email notifications, add these to your .env file:
// EMAIL_USER=your-gmail@gmail.com
// EMAIL_PASS=your-gmail-app-password
// 
// How to get Gmail app password:
// 1. Go to Gmail.com and login
// 2. Enable 2-Factor Authentication
// 3. Go to Security → App passwords
// 4. Generate app password for "BookTech Email"
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('✅ Email notifications enabled');
} else {
  console.warn('⚠️  Email credentials not found. Email notifications will be disabled.');
  console.warn('📝 To enable emails, add EMAIL_USER and EMAIL_PASS to your .env file');
  console.warn('📧 Users will still get payment links, but no email will be sent');
}

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

// Function to send payment email
const sendPaymentEmail = async (userEmail, userName, orderId, paymentLink, orderDetails) => {
  try {
    if (!transporter) {
      console.log('Email transporter not configured, skipping email send');
      return;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Payment Link for Order #${orderId} - BookTech`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">BookTech</h1>
            <p style="margin: 10px 0 0 0;">Complete Your Payment</p>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Hello ${userName},</h2>
            <p style="color: #666;">Your order has been created successfully. Please complete your payment to proceed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
              <h3 style="color: #333; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
              <p><strong>Items:</strong></p>
              <ul>
                ${orderDetails.items.map(item => `<li>${item.title} by ${item.author} - ₹${item.price}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentLink}" 
                 style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Complete Payment
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This payment link will expire in 24 hours. If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 BookTech. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Payment email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending payment email:', error);
  }
};

// AUTHENTICATED ROUTES (require authentication)
// Create Razorpay payment order
router.post('/create-payment', auth, async (req, res) => {
  try {
    console.log('🔍 Payment creation started');
    console.log('📦 Request body:', req.body);
    console.log('👤 User:', req.user);
    
    const { items, total, shippingAddress, paymentMethod, userId } = req.body;
    
    // Validate required fields
    if (!items || !total || !shippingAddress || !paymentMethod) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields: items, total, shippingAddress, paymentMethod',
        received: { items, total, shippingAddress, paymentMethod }
      });
    }
    
    console.log('✅ All required fields present');
    
    // Check if Razorpay is configured
    if (!razorpay) {
      console.log('⚠️  Razorpay not configured, creating demo order');
      
      try {
        // Create demo order without Razorpay
        const orderId = 'DEMO' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        console.log('🆔 Demo Order ID:', orderId);
        
        const order = new Order({
          orderId,
          userId: req.user.id,
          items: items,
          total: total * 1.18,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod,
          status: 'processing',
          paymentStatus: 'completed' // Demo payment completed
        });
        
        console.log('💾 Saving demo order...');
        await order.save();
        console.log('✅ Demo order saved successfully');
        
        // Send demo email if transporter is available
        if (transporter) {
          console.log('📧 Sending demo email...');
          const demoPaymentLink = `https://book-tech.vercel.app/orders?demo=true&orderId=${orderId}`;
          await sendPaymentEmail(
            req.user.email,
            req.user.name,
            orderId,
            demoPaymentLink,
            {
              total: (total * 1.18).toFixed(2),
              items: items
            }
          );
          console.log('✅ Demo email sent');
        } else {
          console.log('⚠️  No email transporter available');
        }
        
        const response = {
          key_id: 'demo_key',
          amount: Math.round(total * 1.18 * 100),
          currency: 'INR',
          order_id: 'demo_order_' + Date.now(),
          receipt: 'demo_receipt',
          payment_link: `https://book-tech.vercel.app/orders?demo=true&orderId=${orderId}`,
          order_id_db: orderId,
          is_demo: true
        };
        
        console.log('📤 Sending demo response:', response);
        return res.json(response);
      } catch (demoError) {
        console.error('❌ Demo order creation failed:', demoError);
        return res.status(500).json({ 
          message: 'Failed to create demo order',
          error: demoError.message 
        });
      }
    }
    
    console.log('💰 Creating Razorpay order...');
    
    // Calculate amount in paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(total * 1.18 * 100); // Including 18% tax
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: 'booktech_' + Date.now(),
      notes: {
        userId: req.user.id,
        items: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress)
      }
    });
    
    console.log('✅ Razorpay order created:', razorpayOrder.id);
    
    // Create order in database with pending status
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    const order = new Order({
      orderId,
      userId: req.user.id,
      items: items,
      total: total * 1.18,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id
    });
    
    console.log('💾 Saving order to database...');
    await order.save();
    console.log('✅ Order saved successfully');
    
    // Create payment link
    const paymentLink = `https://checkout.razorpay.com/v1/pay/${razorpayOrder.id}?key=${process.env.RAZORPAY_KEY_ID}`;
    
    // Send payment email
    if (transporter) { // Use the transporter we created earlier
      console.log('📧 Sending payment email...');
      await sendPaymentEmail(
        req.user.email,
        req.user.name,
        orderId,
        paymentLink,
        {
          total: (total * 1.18).toFixed(2),
          items: items
        }
      );
      console.log('✅ Payment email sent');
    } else {
      console.log('⚠️  No email transporter available');
    }
    
    const response = {
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      order_id: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
      payment_link: paymentLink,
      order_id_db: orderId
    };
    
    console.log('📤 Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Error creating payment order:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to create payment order',
      error: error.message,
      stack: error.stack
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

// Test routes (NO AUTHENTICATION REQUIRED)
router.get('/test', (req, res) => {
  res.json({ message: 'Orders route is working!', timestamp: new Date().toISOString() });
});

// Health check route (NO AUTHENTICATION REQUIRED)
router.get('/health', (req, res) => {
  res.json({ 
    message: 'Orders API is healthy!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    razorpay: !!razorpay,
    email: !!transporter
  });
});

// Test database connection and Order model (NO AUTHENTICATION REQUIRED)
router.get('/test-db', async (req, res) => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test Order model
    const testOrder = new Order({
      orderId: 'TEST' + Date.now(),
      userId: '507f1f77bcf86cd799439011', // Test ObjectId
      items: [{
        bookId: 'test-book-1',
        title: 'Test Book',
        price: 10,
        author: 'Test Author'
      }],
      total: 10,
      shippingAddress: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: {
        type: 'demo'
      },
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    console.log('✅ Order model created successfully');
    console.log('📦 Test order data:', testOrder);
    
    res.json({ 
      message: 'Database and Order model working!', 
      timestamp: new Date().toISOString(),
      testOrder: testOrder
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({ 
      message: 'Database test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Simple test route without authentication (NO AUTHENTICATION REQUIRED)
router.post('/test-create', async (req, res) => {
  try {
    console.log('🔍 Test order creation started');
    console.log('📦 Request body:', req.body);
    
    const { items, total, shippingAddress, paymentMethod } = req.body;
    
    // Create demo order
    const orderId = 'TEST' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    console.log('🆔 Test Order ID:', orderId);
    
    const order = new Order({
      orderId,
      userId: '507f1f77bcf86cd799439011', // Test ObjectId
      items: items || [{
        bookId: 'test-book-1',
        title: 'Test Book',
        price: 10,
        author: 'Test Author'
      }],
      total: total || 10,
      shippingAddress: shippingAddress || {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: paymentMethod || {
        type: 'demo'
      },
      status: 'processing',
      paymentStatus: 'completed'
    });
    
    console.log('💾 Saving test order...');
    await order.save();
    console.log('✅ Test order saved successfully');
    
    res.json({
      message: 'Test order created successfully!',
      orderId: orderId,
      is_demo: true
    });
  } catch (error) {
    console.error('❌ Test order creation failed:', error);
    res.status(500).json({ 
      message: 'Test order creation failed',
      error: error.message,
      stack: error.stack
    });
  }
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
    
    // Validate required fields
    if (!items || !total || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Missing required fields: items, total, shippingAddress, paymentMethod' 
      });
    }
    
    // Generate unique order ID
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const order = new Order({
      orderId,
      userId: req.user.id,
      items: items,
      total: total * 1.18, // Including tax
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
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
    // Use orderId field instead of _id
    const order = await Order.findOne({ orderId: req.params.orderId });
    
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
    
    // Use orderId field instead of _id
    const order = await Order.findOne({ orderId: req.params.orderId });
    
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

// Check payment status
router.get('/payment-status/:orderId', auth, async (req, res) => {
  try {
    // Use orderId field instead of _id
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    // If order has Razorpay order ID, check payment status
    if (order.razorpayOrderId && razorpay) {
      try {
        const razorpayOrder = await razorpay.orders.fetch(order.razorpayOrderId);
        const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
        
        if (payments.items && payments.items.length > 0) {
          const payment = payments.items[0];
          if (payment.status === 'captured') {
            order.paymentStatus = 'completed';
            order.status = 'processing';
            await order.save();
          }
        }
      } catch (error) {
        console.error('Error checking Razorpay payment status:', error);
      }
    }
    
    res.json({
      orderId: order.orderId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

module.exports = router; 
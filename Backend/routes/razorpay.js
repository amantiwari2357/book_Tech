const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Razorpay webhook handler
router.post('/webhook', express.json({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('Webhook received - Full body:', JSON.stringify(req.body, null, 2));
    
    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Razorpay webhook received:', event);

    if (event === 'payment_link.paid') {
      const paymentLinkId = payload.payment_link.entity.id;
      // Check if this payment link is for a subscription (by description)
      const description = payload.payment_link.entity.description || '';
      if (description.startsWith('Subscription payment for plan:')) {
        // Find the user by email
        const email = payload.payment_link.entity.customer.email;
        const planName = description.replace('Subscription payment for plan:', '').trim().toLowerCase();
        const User = require('../models/User');
        const user = await User.findOne({ email });
        if (user) {
          user.subscription = planName;
          await user.save();
          console.log('User subscription updated to', planName, 'for', email);
        }
      } else {
        // Book order payment
        await Order.findOneAndUpdate(
          { paymentLinkId },
          { 
            paymentStatus: 'paid',
            updatedAt: Date.now()
          }
        );
        console.log('Payment marked as paid for paymentLinkId:', paymentLinkId);
      }
    } else if (event === 'payment_link.failed') {
      const paymentLinkId = payload.payment_link.entity.id;
      await Order.findOneAndUpdate(
        { paymentLinkId },
        { 
          paymentStatus: 'failed',
          updatedAt: Date.now()
        }
      );
      console.log('Payment marked as failed for paymentLinkId:', paymentLinkId);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ status: 'error' });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Razorpay route is working' });
});

// Manual payment status update (for testing)
router.post('/update-payment-status', async (req, res) => {
  try {
    console.log('Update payment status called with body:', req.body);
    
    const { paymentLinkId, status } = req.body;
    
    if (!paymentLinkId || !status) {
      return res.status(400).json({ message: 'paymentLinkId and status are required' });
    }

    const order = await Order.findOneAndUpdate(
      { paymentLinkId },
      { 
        paymentStatus: status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`Payment status updated to ${status} for paymentLinkId:`, paymentLinkId);
    res.json({ message: 'Payment status updated successfully', order });
  } catch (error) {
    console.error('Manual payment status update error:', error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

module.exports = router; 
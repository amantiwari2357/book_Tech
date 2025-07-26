const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Razorpay webhook handler
router.post('/webhook', express.json({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Razorpay webhook received:', event);

    if (event === 'payment_link.paid') {
      const paymentLinkId = payload.payment_link.entity.id;
      await Order.findOneAndUpdate(
        { paymentLinkId },
        { 
          paymentStatus: 'paid',
          updatedAt: Date.now()
        }
      );
      console.log('Payment marked as paid for paymentLinkId:', paymentLinkId);
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

module.exports = router; 
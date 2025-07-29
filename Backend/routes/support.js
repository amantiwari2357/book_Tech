const express = require('express');
const Support = require('../models/Support');
const auth = require('../middleware/auth'); // Added auth middleware

const router = express.Router();

// Submit support message
router.post('/', async (req, res) => {
  const { email, message, userId } = req.body;
  const support = new Support({ email, message, user: userId });
  await support.save();
  res.json({ message: 'Support message received.' });
});

// POST /support/appeal - Customer appeals a review moderation action
router.post('/appeal', auth, async (req, res) => {
  const { reviewId, bookId, message } = req.body;
  if (!reviewId || !bookId || !message) {
    return res.status(400).json({ message: 'reviewId, bookId, and message are required' });
  }
  const appeal = await Support.create({
    user: req.user.id,
    message,
    appealType: 'review',
    reviewId,
    bookId,
    status: 'pending',
  });
  res.status(201).json(appeal);
});

module.exports = router; 
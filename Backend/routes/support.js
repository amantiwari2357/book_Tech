const express = require('express');
const Support = require('../models/Support');

const router = express.Router();

// Submit support message
router.post('/', async (req, res) => {
  const { email, message, userId } = req.body;
  const support = new Support({ email, message, user: userId });
  await support.save();
  res.json({ message: 'Support message received.' });
});

module.exports = router; 
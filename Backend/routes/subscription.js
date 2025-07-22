const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get subscription status
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ subscription: user.subscription });
});

// Subscribe to plan
router.post('/', auth, async (req, res) => {
  const plan = req.body.plan || 'premium';
  const user = await User.findById(req.user.id);
  user.subscription = plan;
  await user.save();
  res.json({ subscription: user.subscription });
});

// Cancel subscription
router.delete('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.subscription = 'none';
  await user.save();
  res.json({ subscription: user.subscription });
});

module.exports = router; 
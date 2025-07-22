const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Send a notification/message
router.post('/', auth, async (req, res) => {
  const { recipientId, message, type = 'info' } = req.body;
  if (!recipientId || !message) return res.status(400).json({ message: 'Recipient and message required' });
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: req.user.id,
      message,
      type,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email role');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
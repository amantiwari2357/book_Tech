const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Set up multer for avatar uploads (store in /uploads/avatars)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  },
});
const upload = multer({ storage });

// GET current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE user profile (name, email, avatar)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, subscription: user.subscription, cart: user.cart, orders: user.orders } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPLOAD avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // For demo, serve from /uploads/avatars
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  // Optionally update user avatar field
  const user = await User.findById(req.user.id);
  if (user) {
    user.avatar = avatarUrl;
    await user.save();
  }
  res.json({ avatar: avatarUrl });
});

// CHANGE password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  // In production, send email. For now, log to console.
  console.log(`Password reset link for ${email}: ${resetLink}`);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// Get user reading statistics
router.get('/reading-stats', auth, async (req, res) => {
  try {
    // Get real reading stats from user's reading sessions
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate real reading stats based on actual reading sessions
    const readingStats = {
      booksRead: user.booksRead || 0,
      pagesRead: user.pagesRead || 0,
      readingTime: user.readingTime || 0, // in minutes
      currentStreak: user.currentStreak || 0,
      totalBooks: user.totalBooks || 0,
      favoriteGenres: user.favoriteGenres || ['Fiction', 'Mystery', 'Science Fiction'],
      monthlyProgress: user.monthlyProgress || [
        { month: 'Jan', booksRead: 0, pagesRead: 0 },
        { month: 'Feb', booksRead: 0, pagesRead: 0 },
        { month: 'Mar', booksRead: 0, pagesRead: 0 },
        { month: 'Apr', booksRead: 0, pagesRead: 0 }
      ]
    };
    res.json(readingStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update reading stats
router.post('/reading-stats', auth, async (req, res) => {
  try {
    const { bookId, readingTime, pagesRead } = req.body;
    
    // Update user's reading stats with real data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update reading time (in minutes)
    user.readingTime = (user.readingTime || 0) + (readingTime || 0);
    
    // Update pages read
    user.pagesRead = (user.pagesRead || 0) + (pagesRead || 0);
    
    // Update books read if this is a new book
    if (bookId && !user.readBooks?.includes(bookId)) {
      user.booksRead = (user.booksRead || 0) + 1;
      user.readBooks = user.readBooks || [];
      user.readBooks.push(bookId);
    }
    
    // Update current streak (simplified logic)
    const today = new Date().toDateString();
    if (user.lastReadDate !== today) {
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.lastReadDate = today;
    }
    
    await user.save();
    
    console.log('Reading stats updated with real data:', { bookId, readingTime, pagesRead });
    res.json({ message: 'Reading stats updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    // Mock progress data for now
    const progress = {
      currentBook: {
        id: 'book1',
        title: 'Sample Book',
        progress: 65
      },
      readingTime: 45,
      pagesRead: 2400
    };
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user progress
router.post('/progress', auth, async (req, res) => {
  try {
    const { bookId, progress, readingTime } = req.body;
    // Mock progress update
    res.json({ message: 'Progress updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
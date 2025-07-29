const express = require('express');
const BookDesign = require('../models/BookDesign');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all book designs (for home page display)
router.get('/', async (req, res) => {
  try {
    console.log('📚 Book designs API called - fetching all designs...');
    // For home page, show all book designs regardless of status
    const bookDesigns = await BookDesign.find()
      .populate('authorRef', 'name')
      .sort({ createdAt: -1 })
      .limit(10); // Limit to 10 for home page
    
    console.log(`📚 Found ${bookDesigns.length} book designs`);
    bookDesigns.forEach((design, index) => {
      console.log(`  ${index + 1}. ${design.title} - ${design.status} - ${design.isFree ? 'Free' : `$${design.price}`}`);
    });
    
    res.json(bookDesigns);
  } catch (error) {
    console.error('❌ Error fetching book designs:', error);
    res.status(500).json({ message: 'Error fetching book designs' });
  }
});

// Get approved book designs only (for specific use cases)
router.get('/approved', async (req, res) => {
  try {
    const bookDesigns = await BookDesign.find({ status: 'approved' })
      .populate('authorRef', 'name')
      .sort({ createdAt: -1 });
    res.json(bookDesigns);
  } catch (error) {
    console.error('Error fetching approved book designs:', error);
    res.status(500).json({ message: 'Error fetching approved book designs' });
  }
});

// Get book design by ID (public for approved designs)
router.get('/:id', async (req, res) => {
  try {
    const bookDesign = await BookDesign.findById(req.params.id)
      .populate('authorRef', 'name');
    if (!bookDesign) {
      return res.status(404).json({ message: 'Book design not found' });
    }
    
    // If design is approved, allow public access
    if (bookDesign.status === 'approved') {
      return res.json(bookDesign);
    }
    
    // For non-approved designs, require authentication
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token and check permissions
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      if (user.role !== 'admin' && (!bookDesign.authorRef || bookDesign.authorRef.toString() !== user.id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      res.json(bookDesign);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book design' });
  }
});

// Create new book design (author only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author') {
      return res.status(403).json({ message: 'Only authors can create book designs' });
    }

    const {
      title,
      author,
      description,
      coverImageUrl,
      content,
      formatting,
      category,
      tags,
      isFree,
      price,
      isPremium
    } = req.body;

    if (!title || !author || !coverImageUrl || !content) {
      return res.status(400).json({ message: 'Title, author, cover image URL, and content are required' });
    }

    const bookDesign = new BookDesign({
      title,
      author,
      description,
      coverImageUrl,
      content,
      formatting: formatting || {},
      category,
      tags: tags || [],
      isFree: isFree !== undefined ? isFree : true,
      price: price || 0,
      isPremium: isPremium || false,
      authorRef: req.user.id
    });

    await bookDesign.save();
    res.status(201).json(bookDesign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating book design' });
  }
});

// Update book design (author only)
router.put('/:id', auth, async (req, res) => {
  try {
    const bookDesign = await BookDesign.findOne({ 
      _id: req.params.id, 
      authorRef: req.user.id 
    });

    if (!bookDesign) {
      return res.status(404).json({ message: 'Book design not found or not your design' });
    }

    if (bookDesign.status === 'approved') {
      return res.status(400).json({ message: 'Cannot edit approved book designs' });
    }

    const updatedBookDesign = await BookDesign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedBookDesign);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book design' });
  }
});

// Delete book design (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookDesign = await BookDesign.findOneAndDelete({ 
      _id: req.params.id, 
      authorRef: req.user.id 
    });

    if (!bookDesign) {
      return res.status(404).json({ message: 'Book design not found or not your design' });
    }

    res.json({ message: 'Book design deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book design' });
  }
});

// Get author's book designs
router.get('/my/designs', auth, async (req, res) => {
  try {
    const bookDesigns = await BookDesign.find({ authorRef: req.user.id })
      .sort({ createdAt: -1 });
    res.json(bookDesigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your book designs' });
  }
});

// Admin: Get pending book designs
router.get('/admin/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const bookDesigns = await BookDesign.find({ status: 'pending' })
      .populate('authorRef', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookDesigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending book designs' });
  }
});

// Admin: Approve book design
router.post('/admin/approve/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const bookDesign = await BookDesign.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!bookDesign) {
      return res.status(404).json({ message: 'Book design not found' });
    }

    // Send notification to author
    await Notification.create({
      recipient: bookDesign.authorRef,
      sender: req.user.id,
      message: `Your book design "${bookDesign.title}" has been approved and is now available for reading.`,
      type: 'info',
    });

    res.json(bookDesign);
  } catch (error) {
    res.status(500).json({ message: 'Error approving book design' });
  }
});

// Admin: Reject book design
router.post('/admin/reject/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const bookDesign = await BookDesign.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!bookDesign) {
      return res.status(404).json({ message: 'Book design not found' });
    }

    // Send notification to author
    await Notification.create({
      recipient: bookDesign.authorRef,
      sender: req.user.id,
      message: `Your book design "${bookDesign.title}" has been rejected. Please review and resubmit.`,
      type: 'warning',
    });

    res.json(bookDesign);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting book design' });
  }
});

// Increment read count
router.post('/:id/read', async (req, res) => {
  try {
    const bookDesign = await BookDesign.findByIdAndUpdate(
      req.params.id,
      { $inc: { readCount: 1 } },
      { new: true }
    );

    if (!bookDesign) {
      return res.status(404).json({ message: 'Book design not found' });
    }

    res.json({ readCount: bookDesign.readCount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating read count' });
  }
});

// Purchase book design (if not free)
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const bookDesign = await BookDesign.findById(req.params.id);
    
    if (!bookDesign) {
      return res.status(404).json({ message: 'Book design not found' });
    }

    if (bookDesign.isFree) {
      return res.status(400).json({ message: 'This book is free to read' });
    }

    // Here you would integrate with your payment system
    // For now, just increment purchase count
    bookDesign.purchaseCount += 1;
    await bookDesign.save();

    res.json({ message: 'Purchase successful', purchaseCount: bookDesign.purchaseCount });
  } catch (error) {
    res.status(500).json({ message: 'Error processing purchase' });
  }
});

module.exports = router; 
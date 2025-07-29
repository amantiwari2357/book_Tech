const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // For appeals
  appealType: { type: String, enum: ['review'], default: undefined },
  reviewId: { type: String },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
  moderatorResponse: { type: String },
});

module.exports = mongoose.model('Support', supportSchema); 
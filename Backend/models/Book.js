const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  comment: { type: String },
  date: { type: Date, default: Date.now },
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  coverImage: { type: String },
  category: { type: String },
  genre: { type: String },
  tags: [{ type: String }],
  isPremium: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  // 'soft' = only online, 'hard' = hardcopy available
  readingType: { type: String, enum: ['soft', 'hard'], required: true },
  // Where to display after approval: 'hero' or 'view-all'
  displayType: { type: String, enum: ['hero', 'view-all'] },
  // Distribution after approval: 'soft' = read only, 'hard' = order enabled
  distributionType: { type: String, enum: ['soft', 'hard'] },
  authorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviews: [reviewSchema],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  sales: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
});

module.exports = mongoose.model('Book', bookSchema); 
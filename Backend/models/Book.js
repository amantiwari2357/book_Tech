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
  authorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviews: [reviewSchema],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  sales: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
});

module.exports = mongoose.model('Book', bookSchema); 
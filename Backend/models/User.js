const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription: { type: String, enum: ['none', 'basic', 'premium', 'enterprise'], default: 'none' },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  role: { type: String, enum: ['customer', 'author', 'admin'], default: 'customer' },
  orders: [orderSchema],
  
  // Reading stats fields
  booksRead: { type: Number, default: 0 },
  pagesRead: { type: Number, default: 0 },
  readingTime: { type: Number, default: 0 }, // in minutes
  currentStreak: { type: Number, default: 0 },
  totalBooks: { type: Number, default: 0 },
  favoriteGenres: [{ type: String }],
  monthlyProgress: [{
    month: String,
    booksRead: { type: Number, default: 0 },
    pagesRead: { type: Number, default: 0 }
  }],
  readBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  lastReadDate: { type: String },
  avatar: { type: String }
});

module.exports = mongoose.model('User', userSchema); 
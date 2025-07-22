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
});

module.exports = mongoose.model('User', userSchema); 
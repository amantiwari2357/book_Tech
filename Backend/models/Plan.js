const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  features: [{ type: String, required: true }],
  isPopular: { type: Boolean, default: false },
});

module.exports = mongoose.model('Plan', planSchema); 
const mongoose = require('mongoose');

const bookDesignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  coverImageUrl: { type: String, required: true },
  content: { type: String, required: true },
  
  // Book formatting settings
  formatting: {
    fontSize: { type: Number, default: 16 },
    fontFamily: { type: String, default: 'Arial' },
    lineHeight: { type: Number, default: 1.5 },
    textColor: { type: String, default: '#000000' },
    backgroundColor: { type: String, default: '#ffffff' },
    pageWidth: { type: Number, default: 5.5 }, // inches
    pageHeight: { type: Number, default: 8.5 }, // inches
    margins: {
      top: { type: Number, default: 0.5 },
      bottom: { type: Number, default: 0.5 },
      left: { type: Number, default: 0.75 },
      right: { type: Number, default: 0.75 }
    }
  },
  
  // Book metadata
  category: { type: String },
  tags: [{ type: String }],
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  
  // Status and approval
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  authorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Reading stats
  readCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookDesignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BookDesign', bookDesignSchema); 
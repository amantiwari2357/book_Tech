const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  actionType: { type: String, enum: ['edit', 'delete'], required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  review: { type: String, required: true }, // review _id as string
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now },
  oldValue: { type: Object },
  newValue: { type: Object },
});

module.exports = mongoose.model('ModerationLog', moderationLogSchema); 
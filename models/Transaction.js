const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'flagged'], default: 'completed' },
  isFlagged: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  metadata: { type: Object }
}, { timestamps: true });

// Auto-filter out soft-deleted transactions
transactionSchema.pre(/^find/, function() {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model('Transaction', transactionSchema);

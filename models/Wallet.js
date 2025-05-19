const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balances: {
    USD: { type: Number, default: 0 },
    EUR: { type: Number, default: 0 }
    // Add more currencies as needed
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);

const express = require('express');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Admin-only middleware
function adminOnly(req, res, next) {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  next();
}

// View flagged transactions
router.get('/flagged', auth, adminOnly, async (req, res) => {
  const flagged = await Transaction.find({ isFlagged: true, isDeleted: false });
  res.json(flagged);
});

// Aggregate total balances
router.get('/aggregate', auth, adminOnly, async (req, res) => {
  const wallets = await Wallet.find({ isDeleted: false });
  const totals = {};
  wallets.forEach(w => {
    for (const [cur, amt] of Object.entries(w.balances)) {
      totals[cur] = (totals[cur] || 0) + amt;
    }
  });
  res.json(totals);
});

// Top users by balance
router.get('/top-users', auth, adminOnly, async (req, res) => {
  const wallets = await Wallet.find({ isDeleted: false }).populate('user');
  const sorted = wallets
    .map(w => ({
      user: w.user.email,
      total: Object.values(w.balances).reduce((a, b) => a + b, 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  res.json(sorted);
});

module.exports = router;

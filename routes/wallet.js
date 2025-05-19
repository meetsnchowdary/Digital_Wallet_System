const express = require('express');
const Wallet = require('../models/Wallet');
const auth = require('../middleware/auth');
const router = express.Router();

// Get wallet balances
router.get('/', auth, async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id, isDeleted: false });
  if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
  res.json(wallet.balances);
});

module.exports = router;

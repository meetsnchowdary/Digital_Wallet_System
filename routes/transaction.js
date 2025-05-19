const express = require('express');
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { checkFraud } = require('../utils/fraudDetection');
const { sendMockEmail } = require('../utils/mailer');
const router = express.Router();

// Deposit
router.post('/deposit', auth, rateLimit, async (req, res) => {
  const { amount, currency } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  const wallet = await Wallet.findOne({ user: req.user._id, isDeleted: false });
  wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
  await wallet.save();

  const fraud = await checkFraud(req.user._id, 'deposit', amount, currency);
  const tx = await Transaction.create({
    type: 'deposit',
    to: req.user._id,
    amount,
    currency,
    isFlagged: fraud.isFlagged,
    status: fraud.isFlagged ? 'flagged' : 'completed',
    metadata: fraud.reason ? { reason: fraud.reason } : {}
  });

  if (fraud.isFlagged) {
    await sendMockEmail(
      req.user.email,
      'Suspicious Deposit Alert',
      `Your deposit of ${amount} ${currency} was flagged: ${fraud.reason}`
    );
  }

  res.json({ message: 'Deposit successful', fraud: fraud.isFlagged ? fraud.reason : null });
});

// Withdraw
router.post('/withdraw', auth, rateLimit, async (req, res) => {
  const { amount, currency } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  const wallet = await Wallet.findOne({ user: req.user._id, isDeleted: false });
  if ((wallet.balances[currency] || 0) < amount)
    return res.status(400).json({ message: 'Insufficient funds' });

  wallet.balances[currency] -= amount;
  await wallet.save();

  const fraud = await checkFraud(req.user._id, 'withdraw', amount, currency);
  const tx = await Transaction.create({
    type: 'withdraw',
    from: req.user._id,
    amount,
    currency,
    isFlagged: fraud.isFlagged,
    status: fraud.isFlagged ? 'flagged' : 'completed',
    metadata: fraud.reason ? { reason: fraud.reason } : {}
  });

  if (fraud.isFlagged) {
    await sendMockEmail(
      req.user.email,
      'Suspicious Withdrawal Alert',
      `Your withdrawal of ${amount} ${currency} was flagged: ${fraud.reason}`
    );
  }

  res.json({ message: 'Withdrawal successful', fraud: fraud.isFlagged ? fraud.reason : null });
});

// Transfer
router.post('/transfer', auth, rateLimit, async (req, res) => {
  const { toEmail, amount, currency } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  const recipient = await User.findOne({ email: toEmail, isDeleted: false });
  if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
  if (recipient._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot transfer to self' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderWallet = await Wallet.findOne({ user: req.user._id, isDeleted: false }).session(session);
    const recipientWallet = await Wallet.findOne({ user: recipient._id, isDeleted: false }).session(session);

    if ((senderWallet.balances[currency] || 0) < amount)
      throw new Error('Insufficient funds');

    senderWallet.balances[currency] -= amount;
    recipientWallet.balances[currency] = (recipientWallet.balances[currency] || 0) + amount;

    await senderWallet.save();
    await recipientWallet.save();

    const fraud = await checkFraud(req.user._id, 'transfer', amount, currency);
    const tx = await Transaction.create([{
      type: 'transfer',
      from: req.user._id,
      to: recipient._id,
      amount,
      currency,
      isFlagged: fraud.isFlagged,
      status: fraud.isFlagged ? 'flagged' : 'completed',
      metadata: fraud.reason ? { reason: fraud.reason } : {}
    }], { session });

    if (fraud.isFlagged) {
      await sendMockEmail(
        req.user.email,
        'Suspicious Transfer Alert',
        `Your transfer of ${amount} ${currency} was flagged: ${fraud.reason}`
      );
    }

    await session.commitTransaction();
    res.json({ message: 'Transfer successful', fraud: fraud.isFlagged ? fraud.reason : null });
  } catch (e) {
    await session.abortTransaction();
    res.status(400).json({ message: e.message });
  } finally {
    session.endSession();
  }
});

// Transaction history
router.get('/history', auth, async (req, res) => {
  const txs = await Transaction.find({
    $or: [{ from: req.user._id }, { to: req.user._id }],
    isDeleted: false
  }).sort({ createdAt: -1 });
  res.json(txs);
});

// Soft delete transaction
router.delete('/:id', auth, async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });
  tx.isDeleted = true;
  tx.deletedAt = new Date();
  await tx.save();
  res.json({ message: 'Transaction soft deleted' });
});

module.exports = router;

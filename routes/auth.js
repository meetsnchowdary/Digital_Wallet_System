const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, isAdmin: !!isAdmin });
  await Wallet.create({ user: user._id });
  res.status(201).json({ message: 'User registered' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.isDeleted) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Soft delete user
router.delete('/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();
  res.json({ message: 'User soft deleted' });
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const AccessCode = require('../models/AccessCode');
const GameSession = require('../models/GameSession');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's codes and game history
router.get('/dashboard', auth, async (req, res) => {
  try {
    const activeCodes = await AccessCode.find({
      userId: req.user.id,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    const gameHistory = await GameSession.find({ userId: req.user.id })
      .populate('gameId')
      .sort({ playedAt: -1 })
      .limit(10);

    res.json({
      activeCodes,
      gameHistory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const AccessCode = require('../models/AccessCode');
const GameSession = require('../models/GameSession');
const auth = require('../middleware/auth');

const router = express.Router();

// Verify and use access code
router.post('/verify', auth, async (req, res) => {
  try {
    const { code, gameId } = req.body;

    if (!code || !gameId) {
      return res.status(400).json({ error: 'Code and gameId required' });
    }

    const accessCode = await AccessCode.findOne({ code, userId: req.user.id });

    if (!accessCode) {
      return res.status(404).json({ error: 'Invalid access code' });
    }

    if (accessCode.isUsed) {
      return res.status(400).json({ error: 'Code already used' });
    }

    if (new Date() > accessCode.expiresAt) {
      return res.status(400).json({ error: 'Code has expired' });
    }

    // Mark as used
    accessCode.isUsed = true;
    accessCode.usedAt = new Date();
    accessCode.gameUsed = gameId;
    await accessCode.save();

    // Create game session
    const session = new GameSession({
      userId: req.user.id,
      gameId,
      accessCodeId: accessCode._id,
    });
    await session.save();

    res.json({ message: 'Code verified', sessionId: session._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's active codes
router.get('/active', auth, async (req, res) => {
  try {
    const codes = await AccessCode.find({
      userId: req.user.id,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

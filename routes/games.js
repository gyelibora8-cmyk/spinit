const express = require('express');
const Game = require('../models/Game');


const router = express.Router();

// Get all games
router.get('/', async (req,res)=> {
  try {
    const games = await Game.find({ isActive: true });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single game
router.get('/:id', async (req,res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  accessCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessCode',
    required: true,
  },
  result: String,
  analysis: String,
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GameSession', gameSessionSchema);

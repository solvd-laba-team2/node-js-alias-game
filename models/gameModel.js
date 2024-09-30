const mongoose = require("mongoose");


const ScoreSchema = mongoose.Schema({
    word: { type: String },
    status: { type: String, enum: ['guessed', 'not guessed'] },
    guessed: { type: String, default: 'nobody' }
});

const TeamSchema = mongoose.Schema({
    players: { type: [String], default: [] },
    chatID: { type: String },
    score: { type: [ScoreSchema], default: [] }
});

const GameSchema = mongoose.Schema({
    status: { type: String, enum: ['creating', 'playing', 'finished'], default: 'creating' },
    team1: { type: TeamSchema, default: {} },
    team2: { type: TeamSchema, default: {} },
    wonTeamId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', GameSchema);

module.exports = Game;
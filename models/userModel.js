const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter username']
    },

    password: {
        type: String,
        required: [true, 'Please enter password']
    },

    stats: {
        gamesPlayed: { type: Number, required: true, default: 0 },
        gamesWon: { type: Number, required: true, default: 0 },
        wordsGuessed: { type: Number, required: true, default: 0 }
    },

    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
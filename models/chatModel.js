const mongoose = require('mongoose');




const MessageSchema = mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    sender: { type: String, required: true },
    type: { type: String, enum: ['description', 'message'], required: true },
    content: { type: String, required: true }
});

const ChatScheme = mongoose.Schema({
    messages: { type: [MessageSchema], default: [] }
});

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;


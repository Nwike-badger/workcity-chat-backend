
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: [true, 'Message text cannot be empty'],
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true, 
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
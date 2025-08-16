// routes/messages.routes.js
const express = require('express');
const verifyToken = require('../middleware/auth.middleware');
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');

const router = express.Router();


router.get('/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ msg: 'Not authorized to view this conversation.' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'email _id') 
      .sort({ createdAt: 1 }); 

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
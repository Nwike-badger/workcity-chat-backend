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

router.delete('/:messageId', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found.' });
    }

    // Security check: Ensure the user deleting the message is the original sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ msg: 'You are not authorized to delete this message.' });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Optional: You might want to update the 'lastMessage' in the conversation if this was it.
    // This part can be complex, so we'll omit it for now for simplicity, but it's something to consider.

    res.json({ msg: 'Message deleted successfully.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
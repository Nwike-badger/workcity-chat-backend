// routes/chat.routes.js
const express = require('express');
const verifyToken = require('../middleware/auth.middleware');
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');

const router = express.Router();


router.get('/', verifyToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
    .populate('participants', 'email _id') 
    .populate({ 
        path: 'lastMessage',
        populate: {
            path: 'sender',
            select: 'email _id'
        }
    })
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.userId;

    if (!recipientId) {
      return res.status(400).json({ msg: 'Recipient ID is required.' });
    }

    
    if (senderId === recipientId) {
      return res.status(400).json({ msg: 'Cannot create a conversation with yourself.' });
    }

    
    const existingConversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (existingConversation) {
    
      return res.status(200).json(existingConversation);
    }


    const newConversation = new Conversation({
      participants: [senderId, recipientId],
    });

    await newConversation.save();

    
    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate('participants', 'email _id');

    res.status(201).json(populatedConversation);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Find the conversation to ensure the user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId, // Security check
    });

    if (!conversation) {
      return res.status(403).json({ msg: 'Not authorized to delete this conversation.' });
    }

    // Step 1: Delete all messages within this conversation
    await Message.deleteMany({ conversation: conversationId });

    // Step 2: Delete the conversation itself
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ msg: 'Conversation and all its messages have been deleted.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
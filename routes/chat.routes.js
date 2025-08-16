// routes/chat.routes.js
const express = require('express');
const verifyToken = require('../middleware/auth.middleware');
const Conversation = require('../model/Conversation');

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



module.exports = router;
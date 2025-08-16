

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware'); 
const Conversation = require('../model/Conversation');
const Message = require('../model/Message'); 

router.get('/', verifyToken, async (req, res) => {
    try {
        
        const conversations = await Conversation.find({
            participants: req.userId
        })
        .populate('participants', 'email role online') 
        .sort({ updatedAt: -1 }); 

        res.json(conversations);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/:conversationId/messages', verifyToken, async (req, res) => {
    try {
        const { conversationId } = req.params; 
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit; 

        
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        
        if (!conversation.participants.includes(req.userId)) {
            return res.status(403).json({ msg: 'Unauthorized: You are not a participant in this conversation.' });
        }

        
        const messages = await Message.find({ conversationId })
            .populate('senderId', 'email') 
            .sort({ timestamp: 1 }) 
            .skip(skip) 
            .limit(limit); 

        
        const totalMessages = await Message.countDocuments({ conversationId });

        res.json({
            messages,
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: page
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { conversationId, content } = req.body; 
        const senderId = req.userId; 

        
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return res.status(400).json({ msg: 'Message content cannot be empty.' });
        }

        
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found.' });
        }
        if (!conversation.participants.includes(senderId)) {
            return res.status(403).json({ msg: 'Unauthorized: You cannot send messages to this conversation.' });
        }

        
        const newMessage = new Message({
            conversationId,
            senderId,
            content,
            readBy: [senderId] 
        });

        
        await newMessage.save();

        
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        
        res.status(201).json(newMessage);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 

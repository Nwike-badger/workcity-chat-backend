// socketHandler.js

const jwt = require('jsonwebtoken');
const User = require('./model/User');
const Message = require('./model/Message');
const Conversation = require('./model/Conversation');

const onlineUsers = new Map();

module.exports = function (io) {
    
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.user.id).select('email role'); 
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            socket.user = user; 
            socket.userId = user.id; 
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.email} (${socket.userId})`);

        
        onlineUsers.set(socket.userId, socket.user);
        io.emit('onlineUsers', Array.from(onlineUsers.values()));

        
        socket.on('joinConversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.userId} joined room: ${conversationId}`);
        });
        
        
        socket.on('leaveConversation', (conversationId) => {
            socket.leave(conversationId);
            console.log(`User ${socket.userId} left room: ${conversationId}`);
        });

        
        socket.on('sendMessage', async ({ conversationId, text }, callback) => {
            try {
                if (!conversationId || !text || text.trim() === '') {
                    return callback({ error: 'Message content cannot be empty.' });
                }

                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(socket.userId)) {
                    return callback({ error: 'Unauthorized to send message.' });
                }

                const newMessage = new Message({
                    conversation: conversationId,
                    sender: socket.userId,
                    text,
                    readBy: [socket.userId],
                });
                await newMessage.save();

                
                const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'email _id');
                
                
                conversation.lastMessage = populatedMessage._id;
                await conversation.save();

                
                io.to(conversationId).emit('newMessage', populatedMessage);

                
                if (callback) {
                    callback(populatedMessage);
                }

            } catch (err) {
                console.error('Error sending message:', err.message);
                if (callback) {
                    callback({ error: 'Failed to send message.' });
                }
            }
        });

        
        socket.on('typing', ({ conversationId }) => {
            socket.to(conversationId).emit('typing', {
                user: socket.user,
                conversationId,
            });
        });

        
        socket.on('stopTyping', ({ conversationId }) => {
            socket.to(conversationId).emit('stopTyping', {
                user: socket.user,
                conversationId,
            });
        });

        
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.email}`);
            onlineUsers.delete(socket.userId);
            io.emit('onlineUsers', Array.from(onlineUsers.values()));
        });
    });
};
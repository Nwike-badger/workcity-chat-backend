
const jwt = require('jsonwebtoken'); 
const User = require('./model/User'); 
const Message = require('./model/Message'); 
const Conversation = require('./model/Conversation'); 

const onlineUsers = new Map(); 

module.exports = function(io) {
    
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token; 

        if (!token) {
            console.log('Socket Auth: No token provided.');
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');

            
            socket.userId = decoded.user.id;
            socket.userRole = decoded.user.role;

            
            await User.findByIdAndUpdate(socket.userId, { online: true });

            console.log(`Socket Auth: User ${socket.userId} authenticated.`);
            next(); 
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            
            next(new Error('Authentication error: Invalid token'));
        }
    });

    
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId} with socket ID: ${socket.id}`);

        
        if (!onlineUsers.has(socket.userId)) {
            onlineUsers.set(socket.userId, new Set());
        }
        onlineUsers.get(socket.userId).add(socket.id);

        
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));

        
        Conversation.find({ participants: socket.userId })
            .then(conversations => {
                conversations.forEach(conversation => {
                    socket.join(conversation._id.toString());
                    console.log(`User ${socket.userId} joined room: ${conversation._id}`);
                });
            })
            .catch(err => console.error('Error joining conversation rooms:', err.message));


        
        socket.on('sendMessage', async ({ conversationId, content }) => {
            try {
                const senderId = socket.userId; 

                
                if (!conversationId || !content || content.trim() === '') {
                    console.warn('Invalid message data received:', { conversationId, content });
                    return;
                }

                
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(senderId)) {
                    console.warn(`User ${senderId} tried to send message to unauthorized conversation ${conversationId}`);
                    
                    socket.emit('messageError', { conversationId, msg: 'Unauthorized to send message to this conversation.' });
                    return;
                }

                
                const newMessage = new Message({
                    conversationId,
                    senderId,
                    content,
                    readBy: [senderId] 
                });
                await newMessage.save();

                
                const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'email');

                
                io.to(conversationId).emit('newMessage', populatedMessage);

                
                await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

                console.log(`Message sent and saved: ${newMessage._id} in conversation ${conversationId}`);

            } catch (err) {
                console.error('Error sending message:', err.message);
                socket.emit('messageError', { msg: 'Failed to send message.' });
            }
        });

        
        socket.on('typingStart', (conversationId) => {
            
            socket.to(conversationId).emit('typing', {
                conversationId,
                userId: socket.userId,
                isTyping: true
            });
            console.log(`User ${socket.userId} started typing in ${conversationId}`);
        });

        
        socket.on('typingStop', (conversationId) => {
            
            socket.to(conversationId).emit('typing', {
                conversationId,
                userId: socket.userId,
                isTyping: false
            });
            console.log(`User ${socket.userId} stopped typing in ${conversationId}`);
        });

        
        socket.on('markAsRead', async ({ messageId, conversationId }) => {
            try {
                const readerId = socket.userId;

                
                const message = await Message.findById(messageId);
                if (!message) {
                    console.warn(`Attempted to mark non-existent message ${messageId} as read.`);
                    return;
                }

                
                if (message.conversationId.toString() !== conversationId) {
                    console.warn(`Message ${messageId} does not belong to conversation ${conversationId}.`);
                    return;
                }

                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(readerId)) {
                    console.warn(`User ${readerId} tried to mark message in unauthorized conversation ${conversationId} as read.`);
                    return;
                }

                
                if (!message.readBy.includes(readerId)) {
                    message.readBy.push(readerId);
                    await message.save();

                    
                    io.to(conversationId).emit('messageRead', {
                        messageId,
                        readerId,
                        readBy: message.readBy 
                    });
                    console.log(`Message ${messageId} marked as read by ${readerId}`);
                }
            } catch (err) {
                console.error('Error marking message as read:', err.message);
            }
        });


        
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.userId} from socket ID: ${socket.id}`);

            
            if (onlineUsers.has(socket.userId)) {
                onlineUsers.get(socket.userId).delete(socket.id);
                
                if (onlineUsers.get(socket.userId).size === 0) {
                    onlineUsers.delete(socket.userId);
                    
                    await User.findByIdAndUpdate(socket.userId, { online: false });
                }
            }
            
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });
    });
};

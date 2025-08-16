
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000", 
        methods: ["GET", "POST"]
    }
});


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workcitychat');
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

connectDB();


app.use(express.json());


const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const setupSocketIO = require('./socketHandler'); 


app.use('/api/auth', authRoutes);
app.use('/api/conversations', chatRoutes);


app.get('/', (req, res) => res.send('Chat API is running!'));


setupSocketIO(io);


server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware to parse JSON bodies
app.use(express.json());


const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/messages.routes');
const setupSocketIO = require('./socketHandler');


app.use('/api/auth', authRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/messages', messageRoutes);


app.get('/', (req, res) => res.send('Chat API is running 🚀'));


setupSocketIO(io);


const startServer = async () => {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected...');
    

    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Start the server
startServer();
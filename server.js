// server.js or app.js (Example setup)

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); 

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;


const connectDB = async () => {
    try {
        
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workcitychat');
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

connectDB();


app.use(express.json());


const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');


app.use('/api/auth', authRoutes);
app.use('/api/conversations', chatRoutes); 


app.get('/', (req, res) => res.send('Chat API is running!'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));